
require.config(
    {
        paths: {
            'jquery': ['./lib/jquery.min'],
            'paging': './paging',
        },
        waitSeconds: 90
    }

);

require(['jquery', 'paging'], function($, Paging){

    var paging = new Paging();
    window.paging = paging;

    paging.makeLeftEndBtn = function(isActive) {
        var me = this;
        if (isActive) {
            return '';
        } else {
            if (!me.isAbleHide) {
                return '';
            }

            if ((me.currPage - me.leftNum) === me.pageStartFrom) {
                return ''; 
            }

            return '<span onselectstart="return false;" unselectable="on">'+me.pageStartFrom+'...</span>';
        }
    };
    paging.makeRightEndBtn = function(isActive) {
        var me = this;
        if (isActive) {
            return '';
        } else {
            if (!me.isAbleHide) {
                return '';
            }

            if ((me.currPage + me.rightNum) === me.maxPage) {
                return ''; 
            }

            return '<span onselectstart="return false;" unselectable="on">...'+me.maxPage+'</span>';
        }
    };
    paging.init({

        $parDom: $('#J-paging'),
        sortConf: 'prevBtn|leftEndBtn|leftNumBtn|currBtn|rightNumBtn|rightEndBtn|nextBtn',

    });

    paging.repaint();
});
