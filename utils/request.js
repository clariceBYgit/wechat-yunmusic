// 发送ajax请求

// 1.封装功能函数
//   1.功能点明确
//   2.函数内部应保留固定代码（静态的）
//   3.将动态的数据抽取成形参，使用者根据自身的情况动态传入实参
//   4.一个良好的功能函数应该设置形参的默认值（ES6的形参默认值）

// 2.封装功能组件
//   1.功能点明确
//   2.组件内部保留静态的代码
//   3.将动态的数据抽取成props 参数由使用者根据自身的情况以标签属性形式动态传入props数据
//   4.一个良好的组件应该设置组件的必要性以及数据类型
// props: {
//   msg: {
//     required: true,
//     default: 默认值,
//     type: String,

//   }
// }


// 封装功能函数
import config from "./config";
export default (url, data = {}, method = 'GET') => {
    // 1. new Promise 初始化Promise实例的状态为pending
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.host + url,
            data,
            method,
            header:{
                cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item=> item.indexOf('MUSIC_U') !==-1):''
                
            },
            success: (res) => {
                // console.log(res);
                if(data.isLogin){
                    wx.setStorage({
                        key:'cookies',
                        data:res.cookies
                    })
                }
                resolve(res.data); // resolve 修改将promise的状态为成功状态

            },
            fail: (err) => {
                // reject 修改promise的状态为失败状态
                reject(err);
            }
        })
    })
}