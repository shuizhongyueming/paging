/**
 * Created by wangxing on 15/3/19.
 *
 * 能根据需要生成相应的分页代码
 * 能在点击页码之后，对应的更新ui
 * 能提供回调函数，在点击页码之后，返回对应的页码供程序调用
 * 能够由外部主动的去变更页码
 *
 * require jquery
 */

define(function(require) {
    var $ = require('jquery');
    function Paging() {
        var defaultConf = {

            dataRoleName: 'role',
            dataValueName: 'num',


            // 各种选择器，方便后面的事件注册
            selectorLeftEndBtn: '[data-role="pagingLeftEndBtn"]',
            selectorRightEndBtn: '[data-role="pagingRightEndBtn"]',
            selectorPrevBtn: '[data-role="pagingPrevBtn"]',
            selectorNextBtn: '[data-role="pagingNextBtn"]',
            selectorNumBtn: '[data-role="pagingNumBtn"]',
            selectorCurr: '[data-state="pagingCurrBtn"]', // 当前激活状态下的按钮的选择器


            isShowAll: false, // 是否显示全部的numBtn

            // 按钮是否高亮的class，这个主要是用来在后面点击事件中，判断有的时候，不响应
            classBtnActive: 'active',

            /**
             * 在隐藏多余按钮的时候，numBtn能显示多少个
             * 显示的规则是，以当前所在页码为中心
             * 以maxNumBtnShow的一半（小数则floor取小值）即默认的 halfOfMaxNumBtnShow 计算
             * 以此值计数，能否向左向右到达最小值和最大值
             * 如果都不能达到，则先计算 calcFirst 指定的一侧能显示的，再把剩余的能显示的数量给另一侧
             * 如果有一侧能达到，则使其达到，再把剩余的能显示的数量给另一侧
             * 如果都能达到，则都显示
             */
            maxNumBtnShow: 10,
            calcFirst: 'left',

            // 默认的排序
            sortConf: 'leftEndBtn|prevBtn|leftNumBtn|currBtn|rightNumBtn|nextBtn|rightEndBtn',


            /**
             * 在总页码大于此值的时候，开始隐藏多出的numBtn
             * 此值只有在isShowAll 为 false 的时候才有作用
             */
            maxPageToTriggerHide: 10,

            eventType: 'click', // 在按钮上触发页码跳转的事件名称

            pageStartFrom: 1, // 页码从多少开始计数

            currPage: 1, // 当前多少页，初始化的时候为计数开始页

            totalPage: 20, // 总共多少页

            // maxPage // 最大页码 会由totalPage和pageStartFrom计算得出
            // leftNum // 渲染的时候，当前按钮左侧会显示多少个
            // rightNum // 渲染的时候，当前按钮右侧会显示多少个

        };

        $.extend(this, defaultConf);
    }

    /**
     * 初始化Paging的配置并注册相关事件
     * @param conf {object} 配置信息 {
     *      $parDom: 包裹分页内容的节点
     * }
     */
    Paging.prototype.init = function(conf) {
        var me = this;
        if (typeof conf.$parDom === 'undefined') {
            throw new Error('没有$parDom，无法放置生成的分页内容');
        }

        $.extend(me, conf);

        me.regEvent();
        me.repaint();
    };

    /**
     * 注册相关事件
     */
    Paging.prototype.regEvent = function() {
        var me = this;

        me.$parDom.on(me.eventType, me.selectorLeftEndBtn, function(){
            var curr = $(this);
            if (!curr.hasClass(me.classBtnActive)) {
                me.goLeftEnd();
                me.$parDom.trigger('paging','leftEndBtn');
            }
        });

        me.$parDom.on(me.eventType, me.selectorRightEndBtn, function(){
            var curr = $(this);
            if (!curr.hasClass(me.classBtnActive)) {
                me.goRightEnd();
                me.$parDom.trigger('paging','rightEndBtn');
            }
        });

        me.$parDom.on(me.eventType, me.selectorPrevBtn, function(){
            var curr = $(this);
            if (!curr.hasClass(me.classBtnActive)) {
                me.goPrev();
                me.$parDom.trigger('paging','prevBtn');
            }
        });

        me.$parDom.on(me.eventType, me.selectorNextBtn, function(){
            var curr = $(this);
            if (!curr.hasClass(me.classBtnActive)) {
                me.goNext();
                me.$parDom.trigger('paging','nextBtn');
            }
        });

        me.$parDom.on(me.eventType, me.selectorNumBtn, function(){
            var curr = $(this), page;
            if (!curr.hasClass(me.classBtnActive)) {
                page = parseInt(curr.data(me.dataValueName), 10);
                me.showPage(page);
                me.$parDom.trigger('paging','numBtn', page);
            }
        });
    };



    /**
     * 展示指定的页码
     * @param num {Number} 页码
     */
    Paging.prototype.showPage = function(num) {
        var me = this;

        me.currPage = num;
        me.fixPage();
        me.makeHtml();
        // console.log(me.$parDom);
        me.$parDom.html(me.sort());
    };

    /**
     * 重新渲染对应当前页码的UI
     * 用于某些情况下，外部的DOM操作，改变了Paging的样式，又需要恢复的时候
     */
    Paging.prototype.repaint = function() {
        var me = this;

        me.showPage(me.currPage);
    };

    /**
     * 跳转到最初始页
     */
    Paging.prototype.goLeftEnd = function() {
        var me = this;

        me.fixPage();
        me.showPage(me.pageStartFrom);
    };

    /**
     * 跳转到最大页
     */
    Paging.prototype.goRightEnd = function() {
        var me = this;

        me.fixPage();
        me.showPage(me.maxPage);
    };

    /**
     * 跳转到上一页
     */
    Paging.prototype.goPrev = function() {
        var me = this;

        me.fixPage();
        me.showPage(me.currPage - 1);
    };

    /**
     * 跳转到下一页
     */
    Paging.prototype.goNext = function() {
        var me = this;

        me.fixPage();
        me.showPage(me.currPage + 1);
    };


    /**
     * 根据sortConf来对应的把makeHtml生成的内容，进行删减和排序
     * @return {jquery} 生成的内容
     */
    Paging.prototype.sort = function(){
        var me = this,
            arr,
            frag = $('<div></div>');

        arr = me.sortConf.split('|');

        $.each(arr, function(i, n){
            if (typeof me.html[n] === 'undefined') {
                throw new Error('错误的sortConf内容: ' + n);
            }
            if (me.html[n] === '') {
               // console.log('跳过空值');
                return;
            }
            frag.append(me.html[n]);
        });

        // console.log(frag);

        return frag.children();
    };

    /**
     * 生成个个角色对应的HTML
     */
    Paging.prototype.makeHtml = function() {
        var me = this,
            i = 0,
            len = 0,
            dataName = me.dataRoleName,
            leftEndDataValue = me.selectorLeftEndBtn.match(/"(\w+)"/)[1],
            rightEndDataValue = me.selectorRightEndBtn.match(/"(\w+)"/)[1],
            prevDataValue = me.selectorPrevBtn.match(/"(\w+)"/)[1],
            nextDataValue = me.selectorNextBtn.match(/"(\w+)"/)[1],
            numDataValue = me.selectorNumBtn.match(/"(\w+)"/)[1],
            currDataValue = me.selectorCurr.match(/"(\w+)"/)[1],
            tmp;


        me.data = {};
        me.data.leftEndDataValue = leftEndDataValue;
        me.data.rightEndDataValue = rightEndDataValue;
        me.data.prevDataValue = prevDataValue;
        me.data.nextDataValue = nextDataValue;
        me.data.numDataValue = numDataValue;
        me.data.currDataValue = currDataValue;

        me.html = tmp = {};

        // 此处在设定data-的数据集的时候，用的attr而不是data，是方便后面的selector的检索

        /**
         * 在初始页的时候设定leftEndBtn和prevBtn为active，其他情况下为非active
         * 设定leftNumBtn为空
         */
        if (me.currPage === me.pageStartFrom) {
            tmp.leftEndBtn = $(me.makeLeftEndBtn(true)).attr('data-'+dataName, leftEndDataValue);
            tmp.prevBtn = $(me.makePrevBtn(true)).attr('data-'+dataName, prevDataValue);
            tmp.leftNumBtn = '';
        } else {
            tmp.leftEndBtn = $(me.makeLeftEndBtn(false)).attr('data-'+dataName, leftEndDataValue);
            tmp.prevBtn = $(me.makePrevBtn(false)).attr('data-'+dataName, prevDataValue);
        }

        /**
         * 在最大页的时候设定rightEndBtn和nextBtn为active，其他情况下为非active
         * 设定rightNumBtn为空
         */
        if (me.currPage === me.maxPage) {
            tmp.rightEndBtn = $(me.makeRightEndBtn(true)).attr('data-'+dataName, rightEndDataValue);
            tmp.nextBtn = $(me.makeNextBtn(true)).attr('data-'+dataName, nextDataValue);
            tmp.rightNumBtn = '';
        } else {
            tmp.rightEndBtn = $(me.makeRightEndBtn(false)).attr('data-'+dataName, rightEndDataValue);
            tmp.nextBtn = $(me.makeNextBtn(false)).attr('data-'+dataName, nextDataValue);
        }

        /**
         * 在leftNumBtn不为空的时候，根据leftNum的值
         * leftNumBtn的计算，不能从pageStartFrome开始
         * 要从currPage-leftNum开始，保证小于currPage
         */
        if (tmp.leftNumBtn !== '') {
            tmp.leftNumBtn = $(me.makeNumBtn(me.currPage-me.leftNum, false)).attr('data-'+dataName, numDataValue).attr('data-'+me.dataValueName, me.currPage-me.leftNum);


            for (i = me.currPage-me.leftNum+1, len = me.currPage; i < len; i++) {
                tmp.leftNumBtn = tmp.leftNumBtn.add($(me.makeNumBtn(i, false)).attr('data-'+dataName, numDataValue).attr('data-'+me.dataValueName, i));
            }
        }

        /**
         * 在rightNumBtn不为空的时候，根据rightNum的值，从currPage+1开始遍历生成
         */
        if (tmp.rightNumBtn !== '') {
            tmp.rightNumBtn = $(me.makeNumBtn(me.currPage+1, false)).attr('data-'+dataName, numDataValue).attr('data-'+me.dataValueName, me.currPage+1);
            for (i = 2, len = me.rightNum; i <= len; i++) {
                tmp.rightNumBtn = tmp.rightNumBtn.add($(me.makeNumBtn(me.currPage+i, false)).attr('data-'+dataName, numDataValue).attr('data-'+me.dataValueName, me.currPage+i));
            }
        }

        tmp.currBtn = $(me.makeNumBtn(me.currPage, true)).attr('data-'+dataName, currDataValue).attr('data-'+me.dataValueName, me.currPage);

        // console.log(tmp);
    };

    /**
     * 矫正当前的页码数据
     * 用于在调用者修改相关页码数据之后的合理性校验和修正
     * 建议在showPage和repaint逻辑执行之前都调用一次
     */
    Paging.prototype.fixPage = function() {
        var me = this;

        // 矫正maxPage
        me.maxPage = me.pageStartFrom + me.totalPage - 1;

        // 矫正currPage
        if (me.currPage < me.pageStartFrom) {
            me.currPage = me.pageStartFrom;
        }

        if (me.currPage > me.maxPage) {
            me.currPage = me.maxPage;
        }

        me.isAbleHide = (me.isShowAll === false && me.totalPage > me.maxPageToTriggerHide);

        // 在不触发隐藏的时候，全部显示按钮
        if (!me.isAbleHide) {
            me.leftNum = me.currPage - me.pageStartFrom;
            me.rightNum = me.maxPage - me.currPage;
            return;
        }

        if (typeof me.halfOfMaxNumBtnShow === 'undefined' || me.halfOfMaxNumBtnShow > me.maxNumBtnShow) {
            me.halfOfMaxNumBtnShow = Math.ceil(me.maxNumBtnShow / 2);
        }

        // 判断两边能否接触边界
        me.isLeftShowEnd = me.currPage - me.halfOfMaxNumBtnShow <= me.pageStartFrom;
        me.isRightShowEnd = me.currPage + me.halfOfMaxNumBtnShow >= me.maxPage;

        if (me.isLeftShowEnd && me.isRightShowEnd) {

            // 都能接触边界的时候，保证先计算的一边都显示，另外一边再计算
            if (me.calcFirst === 'right') {
                me.rightNum = me.maxPage - me.currPage;

                // 左侧最多能显示的和左侧到达边界需要的数量进行比较
                me.leftNum = Math.min(me.maxNumBtnShow - me.rightNum - 1, me.totalPage - me.rightNum - 1);

            } else {
                me.leftNum = me.currPage - me.pageStartFrom;

                // 右侧最多能显示的和右侧到达边界需要的数量进行比较
                me.rightNum = Math.min(me.maxNumBtnShow - me.leftNum - 1, me.totalPage - me.leftNum - 1);

            }


        } else if (me.isLeftShowEnd && !me.isRightShowEnd) {

            // 左边可以触到边界的时候，左边全显示，右边显示剩下的（除开当前的）
            me.leftNum = me.currPage - me.pageStartFrom;

            // 必须保证左右的加上中间的不能超过totalPage和maxNumBtnShow各自的总数
            me.rightNum = Math.min(me.maxNumBtnShow - me.leftNum - 1, me.totalPage - me.leftNum - 1);
            // me.rightNum = me.maxNumBtnShow - me.leftNum - 1;
        } else if (!me.isLeftShowEnd && me.isRightShowEnd) {

            // 和上面相反
            me.rightNum = me.maxPage - me.currPage;

            me.leftNum = Math.min(me.maxNumBtnShow - me.rightNum - 1, me.totalPage - me.rightNum - 1);
            // me.leftNum = me.maxNumBtnShow - me.rightNum - 1;
        } else {

            // 都不能接触边界的时候
            if (me.calcFirst === 'right') {

                // 如果以右边先开始计算，则右边显示指定的计算值，左边显示剩余的（除开当前的）
                me.rightNum = me.halfOfMaxNumBtnShow;
                me.leftNum = me.maxNumBtnShow - me.halfOfMaxNumBtnShow - 1;
            } else {

                // 和上面相反
                me.leftNum = me.halfOfMaxNumBtnShow;
                me.rightNum = me.maxNumBtnShow - me.halfOfMaxNumBtnShow - 1;
            }
        }

        // console.log('currPage: ' + me.currPage + ';totalPage: ' + me.totalPage + ';maxNumBtnShow ' + me.maxNumBtnShow + ';leftNum: ' + me.leftNum + ';rightNum: ' + me.rightNum);

    };

    /**
     * 生成最左边的终点按钮（一般的说法是：首页）
     * @param isActive {boolean} 当前页码是否就是激活状态，也就是首页
     */
    Paging.prototype.makeLeftEndBtn = function(isActive) {
        if (isActive) {
            return '<span onselectstart="return false;" unselectable="on" class="active">首页</span>';
        } else {
            return '<span onselectstart="return false;" unselectable="on">首页</span>';
        }
    };

    /**
     * 生成最右边的终点按钮（一般的说法是：尾页）
     * @param isActive {boolean} 当前页码是否就是激活状态，也就是尾页
     */
    Paging.prototype.makeRightEndBtn = function(isActive) {
        if (isActive) {
            return '<span onselectstart="return false;" unselectable="on" class="active">尾页</span>';
        } else {
            return '<span onselectstart="return false;" unselectable="on">尾页</span>';
        }
    };

    /**
     * 生成上一页的按钮
     * @param isActive {boolean} 当前页码是否就是激活状态，在首页，没有办法继续上一页了
     */
    Paging.prototype.makePrevBtn = function(isActive) {
        if (isActive) {
            return '<span onselectstart="return false;" unselectable="on" class="active">上一页</span>';
        } else {
            return '<span onselectstart="return false;" unselectable="on">上一页</span>';
        }
    };

    /**
     * 生成下一页的按钮
     * @param isActive {boolean} 当前页码是否就是激活状态，在尾页，没有办法继续下一页了
     */
    Paging.prototype.makeNextBtn = function(isActive) {
        if (isActive) {
            return '<span onselectstart="return false;" unselectable="on" class="active">下一页</span>';
        } else {
            return '<span onselectstart="return false;" unselectable="on">下一页</span>';
        }
    };

    /**
     * 生成数字页的按钮
     * @param num {number} 对应要生成的页码
     * @param isActive {boolean} 当前页码是否就是激活状态，也就是说当前展示的就是当前页码
     */
    Paging.prototype.makeNumBtn = function(num, isActive) {
        if (isActive) {
            return '<span onselectstart="return false;" unselectable="on" class="active">'+num+'</span>';
        } else {
            return '<span onselectstart="return false;" unselectable="on">'+num+'</span>';
        }
    };


    return Paging;

});
