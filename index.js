var generateImages = require('./lib/slice_images')
var getNewPath = require('./lib/new_path')
var suffix = require('suffix')
var replaceExt = require('replace-ext');
var config = hexo.config.image_slice || {}
var priority = typeof config.priority != 'undefined' ? config.priority : 9
var sliceDB = require('./lib/slicedb')


hexo.extend.filter.register('after_generate', generateImages, priority)

hexo.extend.helper.register('image_slice', function (originalPath,attributes,container_attributes) {
    console.log('sliceDB',sliceDB)
      if (typeof attributes === 'undefined'){
          attributes = ''
      }
      if (typeof container_attributes === 'undefined'){
          container_attributes = ''
      }
      // var img_string = `<div style="height:${sliceDB[originalPath].height}px;width:${sliceDB[originalPath].width}px" ${container_attributes}>`
      var img_string = `<div ${container_attributes}>`

      for (i=0;i<sliceDB[originalPath].slice_length;i++){
          var newPath = suffix(originalPath,'-'+i)
          newPath = replaceExt(newPath,'.webp')
          var template = `<img src=${newPath} loading="lazy" height="${sliceDB[originalPath].slices[i].height}px" width="${sliceDB[originalPath].slices[i].width}px" ${attributes}>`
          img_string = img_string + template
      }
      img_string += '</div>'
      return img_string
    });
