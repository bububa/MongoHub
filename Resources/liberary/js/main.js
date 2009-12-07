var Chrome = Class.create();
Chrome.prototype = {
    initialize: function ()
    {
        this.pid = 0;
        this.current_window = Titanium.UI.getCurrentWindow();
        var self = this;
        self.update();
        window.onresize = function (e) {
            self.update(e.target);
        }
    },
    
    update: function(win)
    {
        var self = this;
        //document.body.setStyle({height:(this.current_window.getHeight() -50)+ 'px'});
        $('main-content').setStyle({width: (document.viewport.getWidth() - $('sidebar').getWidth() - 1) + 'px'});
        $('main-innerlist').setStyle({height: ($('main-content').getHeight() - 25) + 'px'});
    }
};