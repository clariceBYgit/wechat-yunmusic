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
        isTriggered:false,//标识下拉刷新是否被触发
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
        console.log(videoListData)
        // 关闭加载完的提示框

        wx.hideLoading();

        let index = 0
        let videoList = videoListData.datas.map(item=>{
            item.id=index++;
            return item;
        })
        this.setData({
            videoList,
            isTriggered:false    // 关闭下拉刷新
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
    // 自定义下拉刷新的回调：scroll-view
    handleRefresher(){
        // 再次发送请求,获取最新的视频列表数据
        // console.log("xial")
        this.getVideoList(this.data.navId);

    },
    // 自定义上拉触底的回调: scroll-view
    handleToLower(){
        console.log('发送请求 || 在前端截取最新的数据 追加到视频列表的后方')
        console.log("网易云音乐暂时没有提供分页的api ")
        // 模拟数据
        // 数据分页：1.后端分页 2.前端分页
        let newVideoList = [
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_AD5D924F21DA0D22B0B58F87FD0D5068",
                        "coverUrl": "https://p1.music.126.net/fp15nN-m4vSsRjmU7zDlPQ==/109951165019352877.jpg",
                        "height": 540,
                        "width": 960,
                        "title": "大威天龙，杀心法海",
                        "description": null,
                        "commentCount": 189,
                        "shareCount": 272,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 16528202
                            },
                            {
                                "resolution": 480,
                                "size": 27739586
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 340000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/MLaxI6c85V1-RpA3hp6Kxg==/109951163601828644.jpg",
                            "accountStatus": 0,
                            "gender": 1,
                            "city": 340100,
                            "birthday": -2209017600000,
                            "userId": 1636748413,
                            "userType": 0,
                            "nickname": "寻梦苍穹",
                            "signature": "",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 109951163601828640,
                            "backgroundImgId": 109951162868126480,
                            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": null,
                            "djStatus": 0,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "109951163601828644",
                            "backgroundImgIdStr": "109951162868126486"
                        },
                        "urlInfo": {
                            "id": "AD5D924F21DA0D22B0B58F87FD0D5068",
                            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/m0VMRJje_3013362504_hd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=iwAKSjpNnPdEZSVtXxRPlyEyFXyoyDiw&sign=076e4cfbeed2dbaf2ad0b4e0d84f5382&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeM8NdF1G41A5V1omZtBlax%2F",
                            "size": 27739586,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 480
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 1105,
                                "name": "最佳饭制",
                                "alg": null
                            },
                            {
                                "id": 3107,
                                "name": "混剪",
                                "alg": null
                            },
                            {
                                "id": 3100,
                                "name": "影视",
                                "alg": null
                            },
                            {
                                "id": 13225,
                                "name": "剧情",
                                "alg": null
                            },
                            {
                                "id": 76106,
                                "name": "饭制混剪",
                                "alg": null
                            },
                            {
                                "id": 24127,
                                "name": "电影",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "AD5D924F21DA0D22B0B58F87FD0D5068",
                        "durationms": 208170,
                        "playTime": 450430,
                        "praisedCount": 2262,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_A368F79CA5350F139045008278B8FE2B",
                        "coverUrl": "https://p1.music.126.net/lp_WFgjQWnmxQQRjUFZgCQ==/109951163574144944.jpg",
                        "height": 720,
                        "width": 1280,
                        "title": "韩国淘气弟弟挑衅在健身的姐姐，姐姐究竟能不能坚持...",
                        "description": "肌肉山山：韩国淘气弟弟挑衅在健身的姐姐，姐姐究竟能不能坚持...",
                        "commentCount": 1958,
                        "shareCount": 1675,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 53285861
                            },
                            {
                                "resolution": 480,
                                "size": 87886511
                            },
                            {
                                "resolution": 720,
                                "size": 139034127
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 230000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/7dBKfR0-rS-feI38DEDreQ==/109951165604373914.jpg",
                            "accountStatus": 0,
                            "gender": 1,
                            "city": 230100,
                            "birthday": 788025600000,
                            "userId": 7394345,
                            "userType": 207,
                            "nickname": "YouTube全球音乐",
                            "signature": "Vx：xytaii ，原ID：朩朩青尘",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 109951165604373920,
                            "backgroundImgId": 109951166291589490,
                            "backgroundUrl": "http://p1.music.126.net/ZzyarRrIQkmww7e7t1ta2Q==/109951166291589488.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": [
                                "华语",
                                "另类/独立",
                                "欧美"
                            ],
                            "experts": {
                                "1": "泛生活视频达人",
                                "2": "生活图文达人"
                            },
                            "djStatus": 10,
                            "vipType": 11,
                            "remarkName": null,
                            "avatarImgIdStr": "109951165604373914",
                            "backgroundImgIdStr": "109951166291589488"
                        },
                        "urlInfo": {
                            "id": "A368F79CA5350F139045008278B8FE2B",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/Csj8hvmg_1871138643_shd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=dWmgrckVMrwDuGHNQmSDLsYpPvKaHTIT&sign=6ddea43b1e3dbc0722eda1ff4db7d00d&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeMEqXhX0mTiqovllXcCTbNh",
                            "size": 139034127,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 720
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 2100,
                                "name": "生活",
                                "alg": null
                            },
                            {
                                "id": 4101,
                                "name": "娱乐",
                                "alg": null
                            },
                            {
                                "id": 94112,
                                "name": "吃秀",
                                "alg": null
                            },
                            {
                                "id": 72116,
                                "name": "短片",
                                "alg": null
                            },
                            {
                                "id": 14105,
                                "name": "恶搞",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "A368F79CA5350F139045008278B8FE2B",
                        "durationms": 830810,
                        "playTime": 2991231,
                        "praisedCount": 15007,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_5E05E12DBD765DEC5E09D3C0A25B2F9E",
                        "coverUrl": "https://p1.music.126.net/hlD0VDDOZ9RlqGfUK6i6yA==/109951164936758145.jpg",
                        "height": 1080,
                        "width": 1920,
                        "title": "【小黄人】愿你可以像他们一样，每天快乐！",
                        "description": "素材选自《小黄人大眼萌 》《小黄人越狱计划 》\n创作不易，喜欢的话请多多支持",
                        "commentCount": 59,
                        "shareCount": 324,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 17051485
                            },
                            {
                                "resolution": 480,
                                "size": 28767645
                            },
                            {
                                "resolution": 720,
                                "size": 42563327
                            },
                            {
                                "resolution": 1080,
                                "size": 81918567
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 370000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/zxO3HYVmJ0RKMjJ4S0LAww==/109951165200319081.jpg",
                            "accountStatus": 0,
                            "gender": 1,
                            "city": 370700,
                            "birthday": 813854241054,
                            "userId": 630514713,
                            "userType": 204,
                            "nickname": "小郭今天奋斗了吗",
                            "signature": "有梦想并且热爱着生活的男孩\n",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 109951165200319090,
                            "backgroundImgId": 109951164863592830,
                            "backgroundUrl": "http://p1.music.126.net/Cqb0yY7gpt3Jc1SzK2mRiw==/109951164863592831.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": {
                                "1": "影视视频达人"
                            },
                            "djStatus": 0,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "109951165200319081",
                            "backgroundImgIdStr": "109951164863592831"
                        },
                        "urlInfo": {
                            "id": "5E05E12DBD765DEC5E09D3C0A25B2F9E",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/6EJiKIRE_2980352305_uhd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=LhIwFmwthfwyzCjOHQzFJwKDDWrASkeX&sign=1699f591af57f3532d46651f3c471723&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeM8NdF1G41A5V1omZtBlax%2F",
                            "size": 81918567,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 1080
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 259129,
                                "name": "超燃联盟",
                                "alg": null
                            },
                            {
                                "id": 57104,
                                "name": "ACG音乐",
                                "alg": null
                            },
                            {
                                "id": 1105,
                                "name": "最佳饭制",
                                "alg": null
                            },
                            {
                                "id": 59115,
                                "name": "动漫混剪",
                                "alg": null
                            },
                            {
                                "id": 4104,
                                "name": "电音",
                                "alg": null
                            },
                            {
                                "id": 3107,
                                "name": "混剪",
                                "alg": null
                            },
                            {
                                "id": 5100,
                                "name": "音乐",
                                "alg": null
                            },
                            {
                                "id": 3100,
                                "name": "影视",
                                "alg": null
                            },
                            {
                                "id": 14146,
                                "name": "兴奋",
                                "alg": null
                            },
                            {
                                "id": 76106,
                                "name": "饭制混剪",
                                "alg": null
                            },
                            {
                                "id": 13198,
                                "name": "动画",
                                "alg": null
                            },
                            {
                                "id": 171121,
                                "name": "小黄人",
                                "alg": null
                            },
                            {
                                "id": 13172,
                                "name": "欧美",
                                "alg": null
                            },
                            {
                                "id": 24127,
                                "name": "电影",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [
                            {
                                "name": "ProgHouse (DJ版)",
                                "id": 1397288794,
                                "pst": 0,
                                "t": 0,
                                "ar": [
                                    {
                                        "id": 32511525,
                                        "name": "泽亦龙",
                                        "tns": [],
                                        "alias": []
                                    }
                                ],
                                "alia": [],
                                "pop": 100,
                                "st": 0,
                                "rt": "",
                                "fee": 8,
                                "v": 2,
                                "crbt": null,
                                "cf": "",
                                "al": {
                                    "id": 82461414,
                                    "name": "ProgHouse",
                                    "picUrl": "http://p4.music.126.net/qTPvitdXOsr9UP631LPeGA==/109951164430694296.jpg",
                                    "tns": [],
                                    "pic_str": "109951164430694296",
                                    "pic": 109951164430694300
                                },
                                "dt": 151786,
                                "h": {
                                    "br": 320000,
                                    "fid": 0,
                                    "size": 6073965,
                                    "vd": -75900
                                },
                                "m": {
                                    "br": 192000,
                                    "fid": 0,
                                    "size": 3644397,
                                    "vd": -73364
                                },
                                "l": {
                                    "br": 128000,
                                    "fid": 0,
                                    "size": 2429613,
                                    "vd": -71834
                                },
                                "a": null,
                                "cd": "01",
                                "no": 3,
                                "rtUrl": null,
                                "ftype": 0,
                                "rtUrls": [],
                                "djId": 0,
                                "copyright": 0,
                                "s_id": 0,
                                "mst": 9,
                                "rtype": 0,
                                "rurl": null,
                                "cp": 1391818,
                                "mv": 0,
                                "publishTime": 0,
                                "privilege": {
                                    "id": 1397288794,
                                    "fee": 8,
                                    "payed": 0,
                                    "st": 0,
                                    "pl": 128000,
                                    "dl": 0,
                                    "sp": 7,
                                    "cp": 1,
                                    "subp": 1,
                                    "cs": false,
                                    "maxbr": 999000,
                                    "fl": 128000,
                                    "toast": false,
                                    "flag": 256,
                                    "preSell": false
                                }
                            }
                        ],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "5E05E12DBD765DEC5E09D3C0A25B2F9E",
                        "durationms": 152853,
                        "playTime": 550567,
                        "praisedCount": 2657,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_DFE1F418C37A4F9B242D375F422757A1",
                        "coverUrl": "https://p1.music.126.net/vBN3PSSP1tytd64QU8TUBw==/109951163888416752.jpg",
                        "height": 1280,
                        "width": 720,
                        "title": "爷爷玩转最潮变装秀，秒变时尚大叔，年轻十岁！",
                        "description": "爷爷玩转最潮变装秀，秒变时尚大叔，年轻十岁！",
                        "commentCount": 111,
                        "shareCount": 36,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 947953
                            },
                            {
                                "resolution": 480,
                                "size": 1657682
                            },
                            {
                                "resolution": 720,
                                "size": 3176897
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 510000,
                            "authStatus": 1,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/v4YKaj33r_KPYPu5sZ15AA==/109951163104371118.jpg",
                            "accountStatus": 0,
                            "gender": 0,
                            "city": 510100,
                            "birthday": -2209017600000,
                            "userId": 1336512339,
                            "userType": 10,
                            "nickname": "爷爷等一下",
                            "signature": "时代再快，不如你们可爱。工作联系VX:z111t333。请说明公司/职位/项目，谢谢。",
                            "description": "爷爷等一下节目创作人",
                            "detailDescription": "爷爷等一下节目创作人",
                            "avatarImgId": 109951163104371120,
                            "backgroundImgId": 109951162868128400,
                            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": {
                                "1": "泛生活视频达人"
                            },
                            "djStatus": 0,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "109951163104371118",
                            "backgroundImgIdStr": "109951162868128395"
                        },
                        "urlInfo": {
                            "id": "DFE1F418C37A4F9B242D375F422757A1",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/l5vqgQBN_1789847901_shd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=DaZzmMvFnmTROPfbHDnVtuZaHRLjnzoh&sign=a7779c74be25ec601194cc7e55ca468b&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeMEqXhX0mTiqovllXcCTbNh",
                            "size": 3176897,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 720
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": [
                            109
                        ],
                        "relateSong": [],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "DFE1F418C37A4F9B242D375F422757A1",
                        "durationms": 13461,
                        "playTime": 617986,
                        "praisedCount": 2658,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_DD468BD7D24C407CD582DFC59373D5CA",
                        "coverUrl": "https://p1.music.126.net/Vy9uIqyuKpgJcxYdOeUdfQ==/109951163787886541.jpg",
                        "height": 720,
                        "width": 1330,
                        "title": "沈腾的《西红柿首富》配上李克勤的《护花使者》，你看着气人不！",
                        "description": "沈腾的《西红柿首富》配上李克勤的《护花使者》，你看着气人不！！！",
                        "commentCount": 80,
                        "shareCount": 124,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 20326427
                            },
                            {
                                "resolution": 480,
                                "size": 33414453
                            },
                            {
                                "resolution": 720,
                                "size": 49008917
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 370000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/tSt3z-tsJa-9xwttpfgsnw==/18718085952706446.jpg",
                            "accountStatus": 0,
                            "gender": 2,
                            "city": 370200,
                            "birthday": 962208000000,
                            "userId": 91427229,
                            "userType": 204,
                            "nickname": "油条豆浆1219",
                            "signature": "为了青春不迷茫，为了花开不败放醒着梦着都要用姿态来翱翔（谢谢大家能够支持关注我一下，谢谢）",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 18718085952706450,
                            "backgroundImgId": 2002210674180204,
                            "backgroundUrl": "http://p1.music.126.net/5L9yqWa_UnlHtlp7li5PAg==/2002210674180204.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": {
                                "1": "音乐视频达人"
                            },
                            "djStatus": 10,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "18718085952706446",
                            "backgroundImgIdStr": "2002210674180204"
                        },
                        "urlInfo": {
                            "id": "DD468BD7D24C407CD582DFC59373D5CA",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/vPFdNgfk_2239706267_shd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=JvVRQeNfJjwyOnMyuVwSstyaqVmSNbiu&sign=8996cce5e75f58e4c932e151a738c0b0&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeM8NdF1G41A5V1omZtBlax%2F",
                            "size": 49008917,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 720
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 1105,
                                "name": "最佳饭制",
                                "alg": null
                            },
                            {
                                "id": 3107,
                                "name": "混剪",
                                "alg": null
                            },
                            {
                                "id": 3100,
                                "name": "影视",
                                "alg": null
                            },
                            {
                                "id": 13129,
                                "name": "喜剧",
                                "alg": null
                            },
                            {
                                "id": 76106,
                                "name": "饭制混剪",
                                "alg": null
                            },
                            {
                                "id": 13244,
                                "name": "华语电影",
                                "alg": null
                            },
                            {
                                "id": 24127,
                                "name": "电影",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "DD468BD7D24C407CD582DFC59373D5CA",
                        "durationms": 194666,
                        "playTime": 852511,
                        "praisedCount": 2630,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_690F90C9B666C3B5D797B85ACAE900A1",
                        "coverUrl": "https://p1.music.126.net/Xf8iZI4-npHEuugYvRBXzQ==/109951163934797464.jpg",
                        "height": 1080,
                        "width": 1920,
                        "title": "是老人变坏了？还是坏人变老了？老奶奶都一起去抢银行了",
                        "description": "是老人变坏了？还是坏人变老了？老奶奶都一起去抢银行了",
                        "commentCount": 19,
                        "shareCount": 50,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 20158835
                            },
                            {
                                "resolution": 480,
                                "size": 33442331
                            },
                            {
                                "resolution": 720,
                                "size": 48304329
                            },
                            {
                                "resolution": 1080,
                                "size": 84125493
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 370000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/9DuTc5ZepPUopUvEdsb85A==/109951163986314185.jpg",
                            "accountStatus": 0,
                            "gender": 0,
                            "city": 370600,
                            "birthday": -2209017600000,
                            "userId": 1718470049,
                            "userType": 0,
                            "nickname": "游音社",
                            "signature": "乐玩游音尽在游音社",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 109951163986314190,
                            "backgroundImgId": 109951162868128400,
                            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": null,
                            "djStatus": 0,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "109951163986314185",
                            "backgroundImgIdStr": "109951162868128395"
                        },
                        "urlInfo": {
                            "id": "690F90C9B666C3B5D797B85ACAE900A1",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/uTWpLoPz_2384290011_uhd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=xQQqnBiQtNSlQwOgkozqGjyTzptCDoRo&sign=56079f56f28d4b931a70a081bc238c2f&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeM8NdF1G41A5V1omZtBlax%2F",
                            "size": 84125493,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 1080
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 3100,
                                "name": "影视",
                                "alg": null
                            },
                            {
                                "id": 94101,
                                "name": "评论与解说",
                                "alg": null
                            },
                            {
                                "id": 15112,
                                "name": "欧美电影",
                                "alg": null
                            },
                            {
                                "id": 13198,
                                "name": "动画",
                                "alg": null
                            },
                            {
                                "id": 24127,
                                "name": "电影",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "690F90C9B666C3B5D797B85ACAE900A1",
                        "durationms": 174080,
                        "playTime": 288425,
                        "praisedCount": 1602,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_E85F0F1D35B189120D5D6D5974043E58",
                        "coverUrl": "https://p1.music.126.net/7dcBy5CgqK9ZT0YYQn3I2Q==/109951164921852410.jpg",
                        "height": 1080,
                        "width": 1920,
                        "title": "这样的【哪吒之魔童降世】的打开方式你绝对没见过",
                        "description": "BGM按先后顺序：Danny Avila - End Of The Night (Explicit)、DJ花神经 - 98k全军出击 (枪声版)、Vicetone、Popeska、Luciana - The New Kings、Tanir、Tyomcha - Da Da Da (Remix by Mikis)、Fall Out Boy - My Songs Know What You Did in the Dark (Light Em Up)、Marshmello - Alone",
                        "commentCount": 67,
                        "shareCount": 413,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 8297741
                            },
                            {
                                "resolution": 480,
                                "size": 12702086
                            },
                            {
                                "resolution": 720,
                                "size": 17445754
                            },
                            {
                                "resolution": 1080,
                                "size": 28449059
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 340000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/Uw8guxDWQwnSL68ez35w0g==/109951165671669746.jpg",
                            "accountStatus": 0,
                            "gender": 1,
                            "city": 340700,
                            "birthday": 982512000000,
                            "userId": 1839603013,
                            "userType": 0,
                            "nickname": "十三剪R",
                            "signature": "关注我带你看最新电影，想看其他电影可以在最新视频下留言，精选后剪出来与他人一起分享你心中的好电影！",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 109951165671669740,
                            "backgroundImgId": 109951165135093650,
                            "backgroundUrl": "http://p1.music.126.net/0BMtNY4kQvMYm2kwVjuvbA==/109951165135093652.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": null,
                            "djStatus": 0,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "109951165671669746",
                            "backgroundImgIdStr": "109951165135093652"
                        },
                        "urlInfo": {
                            "id": "E85F0F1D35B189120D5D6D5974043E58",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/FYn7cHQP_2936995149_uhd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=bBBTJGOlTdzoJdzicOLxrLZfGtuMgzup&sign=03e3fe570e0c55c10f964f964986c3ad&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeMEqXhX0mTiqovllXcCTbNh",
                            "size": 28449059,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 1080
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 57104,
                                "name": "ACG音乐",
                                "alg": null
                            },
                            {
                                "id": 59115,
                                "name": "动漫混剪",
                                "alg": null
                            },
                            {
                                "id": 3102,
                                "name": "二次元",
                                "alg": null
                            },
                            {
                                "id": 15243,
                                "name": "国漫",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [
                            {
                                "name": "End Of The Night",
                                "id": 1324159296,
                                "pst": 0,
                                "t": 0,
                                "ar": [
                                    {
                                        "id": 471420,
                                        "name": "Danny Avila",
                                        "tns": [],
                                        "alias": []
                                    }
                                ],
                                "alia": [],
                                "pop": 100,
                                "st": 0,
                                "rt": "",
                                "fee": 8,
                                "v": 8,
                                "crbt": null,
                                "cf": "",
                                "al": {
                                    "id": 74327710,
                                    "name": "End Of The Night",
                                    "picUrl": "http://p4.music.126.net/4EAAiYmVFk_DBwaDnGoBHQ==/109951165985216901.jpg",
                                    "tns": [],
                                    "pic_str": "109951165985216901",
                                    "pic": 109951165985216900
                                },
                                "dt": 205766,
                                "h": {
                                    "br": 320000,
                                    "fid": 0,
                                    "size": 8231750,
                                    "vd": -63904
                                },
                                "m": null,
                                "l": {
                                    "br": 128000,
                                    "fid": 0,
                                    "size": 3292726,
                                    "vd": -59866
                                },
                                "a": null,
                                "cd": "01",
                                "no": 1,
                                "rtUrl": null,
                                "ftype": 0,
                                "rtUrls": [],
                                "djId": 0,
                                "copyright": 1,
                                "s_id": 0,
                                "mst": 9,
                                "rtype": 0,
                                "rurl": null,
                                "cp": 7001,
                                "mv": 10782194,
                                "publishTime": 1542297600000,
                                "privilege": {
                                    "id": 1324159296,
                                    "fee": 8,
                                    "payed": 0,
                                    "st": 0,
                                    "pl": 128000,
                                    "dl": 0,
                                    "sp": 7,
                                    "cp": 1,
                                    "subp": 1,
                                    "cs": false,
                                    "maxbr": 320000,
                                    "fl": 128000,
                                    "toast": false,
                                    "flag": 4,
                                    "preSell": false
                                }
                            }
                        ],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "E85F0F1D35B189120D5D6D5974043E58",
                        "durationms": 87423,
                        "playTime": 423853,
                        "praisedCount": 3319,
                        "praised": false,
                        "subscribed": false
                    }
                },
                {
                    "type": 1,
                    "displayed": false,
                    "alg": "onlineHotGroup",
                    "extAlg": null,
                    "data": {
                        "alg": "onlineHotGroup",
                        "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
                        "threadId": "R_VI_62_4D580FFCBFBDC51B990552925E2AE06D",
                        "coverUrl": "https://p1.music.126.net/5KlziHIJdL_Lk8sN8YBOew==/109951163938717039.jpg",
                        "height": 1080,
                        "width": 1920,
                        "title": "一代人心中的信仰，10年后却遭多国禁播！神作无人超越",
                        "description": "他是一代人心中的信仰，10年后却遭多国禁播！曾经的神作无人超越！",
                        "commentCount": 358,
                        "shareCount": 179,
                        "resolutions": [
                            {
                                "resolution": 240,
                                "size": 36309346
                            },
                            {
                                "resolution": 480,
                                "size": 57573498
                            },
                            {
                                "resolution": 720,
                                "size": 81909680
                            },
                            {
                                "resolution": 1080,
                                "size": 132118466
                            }
                        ],
                        "creator": {
                            "defaultAvatar": false,
                            "province": 210000,
                            "authStatus": 0,
                            "followed": false,
                            "avatarUrl": "http://p1.music.126.net/tmh3Hi3jYs_ct4egL0j0ow==/109951163910947662.jpg",
                            "accountStatus": 0,
                            "gender": 0,
                            "city": 210200,
                            "birthday": -2209017600000,
                            "userId": 1787781413,
                            "userType": 204,
                            "nickname": "音乐猛抬头",
                            "signature": "",
                            "description": "",
                            "detailDescription": "",
                            "avatarImgId": 109951163910947660,
                            "backgroundImgId": 109951162868126480,
                            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
                            "authority": 0,
                            "mutual": false,
                            "expertTags": null,
                            "experts": {
                                "1": "视频达人"
                            },
                            "djStatus": 0,
                            "vipType": 0,
                            "remarkName": null,
                            "avatarImgIdStr": "109951163910947662",
                            "backgroundImgIdStr": "109951162868126486"
                        },
                        "urlInfo": {
                            "id": "4D580FFCBFBDC51B990552925E2AE06D",
                            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/tO0oYKwz_2388349526_uhd.mp4?ts=1636171221&rid=908E2D5E60D677556FDC9B07125A3D05&rl=3&rs=ZqloNBQYtLVGxuTfbVtvYKZIfpHemevj&sign=a79d50b36d3e541d55d66334b184ac4f&ext=O6JHhhKCNX2k922NcyupVgJuIC0LJjRvtBzsfjpvdSObHUkcDUyFZMIcxn2RpKBcQwqke1Y%2FNHcL3JwMyrwrBmrI7AdJU%2FMEkZzjA3xPxHDuovHFOqGDG%2F35gYLPba3RlspheRaSQtF%2Fapn5ip8xTb1RaGjMAMhNZBuyTOc3kb2yd%2BSJ044kDzE%2BD5h%2F2BtryfbrqPhqtgsQl9LmhoeDq9WSyfkdqqI%2FnqrYNSwJPeM8NdF1G41A5V1omZtBlax%2F",
                            "size": 132118466,
                            "validityTime": 1200,
                            "needPay": false,
                            "payInfo": null,
                            "r": 1080
                        },
                        "videoGroup": [
                            {
                                "id": 58101,
                                "name": "听BGM",
                                "alg": null
                            },
                            {
                                "id": 4101,
                                "name": "娱乐",
                                "alg": null
                            },
                            {
                                "id": 14225,
                                "name": "欧美明星",
                                "alg": null
                            },
                            {
                                "id": 16172,
                                "name": "八卦",
                                "alg": null
                            }
                        ],
                        "previewUrl": null,
                        "previewDurationms": 0,
                        "hasRelatedGameAd": false,
                        "markTypes": null,
                        "relateSong": [],
                        "relatedInfo": null,
                        "videoUserLiveInfo": null,
                        "vid": "4D580FFCBFBDC51B990552925E2AE06D",
                        "durationms": 189525,
                        "playTime": 1097094,
                        "praisedCount": 4189,
                        "praised": false,
                        "subscribed": false
                    }
                }
            ];
            let videoList = this.data.videoList;
            videoList.push(...newVideoList);
            this.setData({
                videoList
            })



    },
    // 点击搜索音乐跳转至搜索页面
    toSearchPage(){
        wx.navigateTo({
          url: '/pages/search/search',
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
        console.log("页面的下拉刷新");
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        console.log("页面的上拉触底");

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function({from}) {
        if(from === 'button'){
            return{
                title:'来自button的转发',
                page:'/page/video/video',
                imageUrl:'/static/images/nvsheng.jpg'
            }
        }else{
            return{
                title:'来自menu的转发',
                page:'/page/video/video',
                imageUrl:'/static/images/nvsheng.jpg'
            }
        }
    }
}) 