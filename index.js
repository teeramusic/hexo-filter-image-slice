var generateImages = require('./lib/slice_images')
var getNewPath = require('./lib/new_path')
var config = hexo.config.image_slice || {}
var priority = typeof config.priority != 'undefined' ? config.priority : 9

hexo.extend.filter.register('after_generate', generateImages, priority)

hexo.extend.helper.register('image_slice', function (original, options) {
  return getNewPath(original, options)
});
