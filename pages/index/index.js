// index.js
// 获取应用实例
const app = getApp()
import request from '../../utils/request'
Page({
    data: {
        bannerList: [], //轮播数据
        recommendList: [], //推荐歌单
        topList: [], //排行榜音乐
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserProfile: false,
        canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
    },
    // 事件处理函数
    bindViewTap() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: async function() {
        let bannerListData = await request('/banner', { type: 2 });
        // 获取推荐歌单数组
        let recommendListData = await request('/personalized', { limit: 10 })
            /*
                需求分析：
                1.需要根据idx的值获取对应的数据
                2.idx的取值范围是 0-20， 我们需要0-4
                3.需要发送5次请求

                前++ 和后++ 的区别
                1.先看到时运算符还是值
                2.先看到运算符就先运算在赋值
                3.先看到值就是先赋值再运算
        
            */
        let index = 0;
        let resultArr = [];
        while (index < 5) {
            let topListData = await request('/top/list', { idx: index++ })
                // splice(会修改原数组，可以对指定的数组进行增删改) slice(不会修改原数组)
            let topListItem = { name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0, 3) }
            resultArr.push(topListItem)
            this.setData({
                // 更新topList的状态值 
                //    不需要等待五次请求全部发送成功，用户体验感更好，但是渲染次数会更多
                topList: resultArr
            })
        }

        this.setData({
            bannerList: bannerListData.banners,
            recommendList: recommendListData.result,

        })
    },
    getUserProfile(e) {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log(res)
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        })
    },
    getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        console.log(e)
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    }
})