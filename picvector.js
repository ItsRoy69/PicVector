jQuery(document).ready(function ($) {
  picvector = new PicVector();
});

Class = function (methods) {
  var klass = function () {
    this.initialize.apply(this, arguments);
  };

  for (var property in methods) {
    klass.prototype[property] = methods[property];
  }

  if (!klass.prototype.initialize) klass.prototype.initialize = function () { };
  return klass;
};

PicVector = Class({

  options: {
    numberofcolors: 16,
    colorquantcycles: 5,
  },

  initialize: function () {
    if (typeof window.FileReader == "undefined") {
      $('.instructions').html('You need a newer browser (Firefox 38+, Safari 7.1+, Chrome 31+) to use this service.');
      $('.upload').attr('disabled', true);
    }

    this.tracer = new ImageTracer();
    this.canvas = $('canvas.canvas')[0]
    this.context = this.canvas.getContext('2d');
    this.canvas.width = $(window).width();
    this.canvas.height = $(window).height();

    var _picvector = this;

    $("#file-select input").change(function (e) {
      $('.spinner').show();
      $('.instructions').hide();

      var reader = new FileReader(),
        f = e.target.files[0];
      reader.onload = (function (file) {

        return function (e) {
          _picvector.img = new Image();
          _picvector.img.onload = function (e) {
            var _img = this;
            _picvector.imgWidth = _img.width;
            _picvector.imgHeight = _img.height;
            _picvector.imgRatio = _img.height / _img.width;

            if (_img.width > 1000 || _img.height > 1000) {
              _picvector.imgWidth = 1000;
              _picvector.imgHeight = _picvector.imgWidth * _picvector.imgRatio;
            }

            _picvector.canvas.width = _picvector.imgWidth;
            _picvector.canvas.height = _picvector.imgHeight;
            _picvector.context.drawImage(_picvector.img, 0, 0, _picvector.canvas.width, _picvector.canvas.width * _picvector.imgRatio);
            _picvector.generate();

          };
          _picvector.img.src = e.target.result;
        };
      })(f);
      reader.readAsDataURL(f);
    });

    this.generate = function () {
      $('#svg').remove();
      var img = _picvector.tracer.getImgdata(_picvector.canvas);
      var svgstr = _picvector.tracer.imagedataToSVG(img, _picvector.options);
      _picvector.tracer.appendSVGString(svgstr, 'svg');

      $('.save').attr('href', "data:image/svg+xml;utf8," + $('#svg').html());
      $('.save').show();
      $('.btn-options').show();
      $('.canvas').hide();
      $('.upload').hide();
      $('#svg').hide();
      $('body').css('background-image', "url('" + "data:image/svg+xml;utf8," + $('#svg').html() + "')")
      $('.spinner').hide();

    }

    $('.btn-options').click(function (e) {
      $('.options').toggle();
    });

    $('.reload').click(function (e) {
      $('.spinner').show();
      _picvector.options.numberofcolors = parseInt($('.colors').val());
      _picvector.options.pathomit = parseInt($('.pathomit').val());
      _picvector.generate();
    });

    $('.save').click(function (e) {
      var name = prompt('Name your image', 'picvector.svg');
      $('.save').attr('download', name);
    });

  },

  clear: function () {
    $('.canvas').show();
    $('.upload').show();
    $('.btn-options').hide();
  }

});

