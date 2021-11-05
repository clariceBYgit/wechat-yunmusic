// pages/video/video.js
import requset from '../../utils/request';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList: [], //视频导航栏数组
        navId:"" , //导航的标识
        videoList :[],//视频动态列表数据
        videoId: '', //视频id标识
        videoUpdateTime:[],//  记录video 播放的时长
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // 获取导航栏数据
        this.getVideoGroupList();
       
    },

    // 获取导航数据
    async getVideoGroupList() {
        let videoGroupListData = await requset('/video/group/list');
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0, 14),
            navId : videoGroupListData.data[0].id

        })
         // 获取视频列表数据
         this.getVideoList(this.data.navId);
    },
    // 获取视频列表数据
    async getVideoList(navId){
        let videoListData = await requset('/video/group',{id:navId});
        // 关闭加载完的提示框

        wx.hideLoading();

        let index = 0
        let videoList = videoListData.datas.map(item=>{
            item.id=index++;
            return item;
        })
        this.setData({
            videoList
        })
        console.log(videoList)
    },
    // 点击切换导航的回调
    navChange(event){
        // let navId = event.currentTarget.id; //通过id传参的时候如果传的是number 会自动转换成string
        // this.setData({navId:navId*1})
        let navId = event.currentTarget.dataset.id
        this.setData({
            navId:navId,
            videoList:[]
        })
        // 显示正在加载
        wx.showLoading({
            title:'正在加载'
        })
        // 动态获取当前导航对应的视频数据
        
        this.getVideoList(this.data.navId)
    },
         // 点击播放/继续播放的回调
   
    handlePlay(event){
    /*
    问题：多个视频同时播放
    需求：
        1.在点击播放的时间中需要找到上一个播放的视频
        2.在播放新视频之前关闭上一个正在播放的视频
    关键：
        1.如何找到上一个视频的实例对象
        2.如何确认点击播放的视频和正在播放的视频不是在同一个视频
    单例模式：
        1.需要创建多个对象的场景 通过一个变量接受 始终保持只有一个对象
        2.节省内存空间
    */
   let vid = event.currentTarget.id;
//    this.vid !==vid && this.videoContext &&this.videoContext.stop();
//         this.vid = vid;
        this.setData({
            videoId:vid
        })
//    创建控制video标签的实例对象
        this.videoContext = wx.createVideoContext(vid)
        // 判断当前的视频是否有播放记录 ，若有直接跳转至上次播放的时长位置
        let { videoUpdateTime } = this.data;
        let videoItem = videoUpdateTime.find(item => item.vid === vid);
        if(videoItem){
            this.videoContext.seek(videoItem.currentTime)
        }
        this.videoContext.play()
        // console.log('paly')
    },

    // 监听视频播放进度的回调
    handleTimeUpdate(e){
        let videoTimeObj = {vid:e.currentTarget.id,currentTime:e.detail.currentTime};
        let {videoUpdateTime} = this.data;
        /**
         * 思路：判断记录播放时长的videoUpdateTime数组中是否有当前视频播放记录
         *  1.如果有，在原有的播放记录中修改播放时间为当前的播放时间
         *  2.如果没有，需要在数组中添加当前视频的播放对象
         */
        let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
        if (videoItem) { //之前有
            videoItem.currentTime = e.detail.currentTime;
        }else{//之前没有
            videoUpdateTime.push(videoTimeObj);
        }
        // 更新videoUpdateTime的状态
        this.setData({
            videoUpdateTime
        })
    },
    // 监听视频播放结束的回调
    handleEnded(e){
        // 若结束 就移出播放记录列表
        let { videoUpdateTime } =this.data;
        // videoUpdateTime.findIndex(item => item.vid===e.currentTarget.id); // 返回元素下标
        videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid===e.currentTarget.id),1);
        this.setData({
            videoUpdateTime 
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})