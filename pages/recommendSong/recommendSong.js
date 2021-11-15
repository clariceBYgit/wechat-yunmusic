// pages/recommendSong/recommedSong.js
import PubSub from 'pubsub-js'
import requset from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        day:'',//天
        month:'',//月
        recommendList:[], //推荐列表
        index:0, //点击音乐的下标
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 判断用户是否登录
        let userInfo = wx.getStorageSync('userInfo');
        if(!userInfo){
            wx.showToast({
                title:"请先登录",
                icon:"none",
                success:()=>{
                    // 跳转至登录页面
                    wx.reLaunch({
                        url:'/pages/login/login'
                    })
                }
            })
        }
        // 自动获取日期
        this.setData({
            day:new Date().getDate(),
            month:new Date().getMonth() + 1
        })
        // 获取用户每日推荐

        this.getRecommendList();
        // 订阅 songDetail页面发布的消息
        PubSub.subscribe('switchType',(msg,type) => {
            let {recommendList, index} = this.data;
            if(type === 'pre'){ //上一首
               ( index === 0 )&& (index = recommendList.length)
                 index -= 1;
            }else{//下一首
               ( index === recommendList.length - 1 )&& (index = -1 )

                index += 1;
            }
            // 更新下标
            this.setData({
                index
            })
            let musicId = recommendList[index].id;
            // 将musicId回传给songDetail页面
            PubSub.publish('musicId',musicId);

        });
        
    },
        // 获取用户每日推荐
    async getRecommendList(){
        let recommendListData = await requset('/recommend/songs');
        this.setData({
            recommendList:recommendListData.recommend
        })
    },
    // toSongDetail 点击跳转至歌曲播放详情 songDetail页面
    toSongDetail(e){
        let {song, index } = e.currentTarget.dataset;
        this.setData({index})
        console.log(song)
        // 不能直接将song对象作为参数
        wx.navigateTo({
            // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
            // url: '/pages/songDetail/songDetail?songPackage=' + JSON.stringify(songPackage)
            url: '/pages/songDetail/songDetail?musicId=' + song.id
          })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})