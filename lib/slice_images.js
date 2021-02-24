var isArray = require('util').isArray
var Promise = require('bluebird')
var micromatch = require('micromatch')
var streamToArray = require('stream-to-array')
var streamToArrayAsync = Promise.promisify(streamToArray)
var getNewPath = require('./new_path')
var applySharpApiOptions = require('./sharp_options').applyOptions
var getResizeOptions = require('./sharp_options').getResizeOptions
var sharp = require('sharp')
var suffix = require('suffix')
var sliceDB = require('./slicedb')
var replaceExt = require('replace-ext')

function generateResponsiveImages() {
    var hexo = this
    var config = hexo.config.image_slice || []
    var rules = config.rules ? config.rules : config
    if (!isArray(rules)) {
        rules = [rules]
    }
    var route = hexo.route
    var routes = route.list()

    return Promise.mapSeries(routes, function(filePath) {
        var sizes = getSizesFor(filePath, rules)
        if (sizes.length == 0) {
            return
        }
        console.log('getSizesFor sizes',sizes)
        var stream = route.get(filePath)
        return streamToArrayAsync(stream).then(function(arr) {
            if (typeof arr[0] === 'string') {
                return arr[0];
            } else {
                return Buffer.concat(arr);
            }
        }).then(function(buffer) {
                var img = sharp(buffer)
                var isPercent = sizes[0].indexOf('%') > -1
                var sliceSize =  parseFloat(sizes[0].match(/[\d\.]+/g)[0]);
                img.metadata().then(function(metadata){
                    console.log('gotMeta!',metadata)
                    sliceDB[filePath]={
                        height:metadata.height,
                        width:metadata.width
                    }
                    var offsetKey = 'top'
                    var offsetKey2 = 'left'
                    var dimension1Key = 'height'
                    var dimension2Key = 'width'
                    var slices = []
                    if(sizes[1] === 'vertical'){
                        offsetKey = 'left'
                        offsetKey2 = 'top'
                        dimension1Key = 'width'
                        dimension2Key = 'height'
                    }
                    var end = metadata[dimension1Key]
                    sliceDB[filePath].slices = []
                    for (var i = 0; i < end; ){
                        var slice = {}
                        slice[dimension2Key]=metadata[dimension2Key]
                        slice[offsetKey]=i
                        slice[dimension1Key]=isPercent ? Math.floor(metadata[dimension1Key]*sliceSize/100) : Math.floor(metadata[dimension1Key])
                        if(slice[dimension1Key]+i > metadata[dimension1Key]){
                            slice[dimension1Key] = metadata[dimension1Key] - i
                        }
                        i += slice[dimension1Key]+1
                        slice[offsetKey2] = 0
                        slices.push(slice)
                        sliceDB[filePath].slices.push(slice)
                    }
                    console.log('slices',slices)
                    console.log('sliceDB[filePath]',sliceDB[filePath])
                    sliceDB[filePath].slice_length = slices.length
                    return Promise.all(slices.map(function(slice,index){
                        var newPath = suffix(filePath,'-'+index)
                        newPath = replaceExt(newPath,'.webp')

                        console.log('newPath,slice',newPath,slice)
                        return route.set(newPath, resizeImageFn(hexo, img, slice))
                    }))

                })
        })
    })
}

function getSizesFor(filePath, rules) {
    return rules.reduce(function(sizes, rule) {
        var pattern = rule.pattern || ''
        var regex = new RegExp(pattern, 'g')
        if (pattern.length && filePath.match(regex) !== null) {
            console.log('matched file:', filePath)
            return sizes.concat(rule.sliceSize || [], rule.sliceDirection || [])
        }
        return sizes
    }, [])
}

function resizeImageFn(hexo, img, config) {
    return function() {
        // console.log(config)
        return applySharpApiOptions(img, config).extract(config).toFormat('webp').toBuffer()
    }
}

module.exports = generateResponsiveImages
