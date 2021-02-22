var generateImages = require('./lib/slice_images')
var getNewPath = require('./lib/new_path')
var suffix = require('suffix')
var replaceExt = require('replace-ext');
var config = hexo.config.image_slice || {}
var priority = typeof config.priority != 'undefined' ? config.priority : 10
var sliceDB = require('./lib/slicedb')


hexo.extend.filter.register('after_generate', generateImages, priority)

hexo.extend.helper.register('image_slice', function (callback) {
    if(typeof callback === 'function'){
        return callback(sliceDB,suffix,replaceExt)
    }
})

console.log('image-slice-loaded')
