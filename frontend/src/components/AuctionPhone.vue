
<template>
  <div>
    <van-row type="flex" justify="center">
      <van-col span="10" class="header-col-left">
        <van-image width="150" height="150" :src="require('@/assets/title.png')" />
      </van-col>
      <van-col span="11" class="header-col-right">
        gazotc.fi<br />
        全球首创<br />
        去中心化OTC交易平台<br />
        Defi世界的门户<br />
      </van-col>
    </van-row>
    <div class="title">
      <div style="padding-top: 0.8rem; padding-left: 1rem;">本轮拍卖信息</div>
    </div>
    <div class="auction">
      <van-row type="flex" justify="center" v-for="(info, i) in auction_info" v-bind:key="i">
        <van-col span="4">{{ info.left_title }}</van-col>
        <van-col span="6">{{ info.left_value }}</van-col>
        <van-col span="5">{{ info.right_title }}</van-col>
        <van-col span="6">{{ info.right_value }}</van-col>
      </van-row>
    </div>
    <van-row type="flex" justify="center" class="control">
      <van-col span="12">
        <van-row type="flex" justify="center" class="input">
          <van-col span="4">出价</van-col>
          <van-col span="11"><el-input v-model="form.low" placeholder="请输入内容" style="width: 5rem;"></el-input></van-col>
          <van-col span="5">USDT</van-col>
        </van-row>
        <van-row type="flex" justify="center" class="input">
          <van-col span="4">数量</van-col>
          <van-col span="11"><el-input v-model="form.gross" placeholder="请输入内容" style="width: 5rem"></el-input></van-col>
          <van-col span="5">GAZ</van-col>
        </van-row>
      </van-col>
      <van-col span="10" class="operator">
        <el-button type="primary" @click="purchase" :disabled="auction_enabled == false" plain>购买</el-button>
        <br />
        剩余时间：{{ remain_time }}
      </van-col>
    </van-row>
    <div class="query">
      <van-row type="flex" justify="space-around">
        <van-col span="4"><el-button type="success" @click="query" plain>余额查询</el-button></van-col>
        <van-col span="15">{{gaz_balance.toFixed(4)}} GAZ</van-col>
      </van-row>
    </div>
    <div class="rule">
      <h4>拍卖规则</h4>
      1.如果本轮拍卖的剩余代币大于你要竞拍的数量，你可用起拍价购买<br />
      2.如果本轮拍卖的剩余代币为0，你的出价必须高于当前最低出价<br />
      3.加价必须是加价幅度的整数倍<br />
      4.在竞拍结束前，按照最低出价的最后出价者最先淘汰的原则<br />
      5.被淘汰后，退回相应资产
    </div>
    <div class="warning">
      <h4>风险提示</h4>
      去中心化OTC是进出DeFi世界的门户，是DeFi生态的新品类。Gazotc.fi处于发展初期,是一次借助区块链和智能合约，由社区参与仲裁的社会实践，没有可以参考的成功项目，风险极大。未来，Gazotc.fi由去中心化自治社区主导，目前由Gazelle.fi基金会负责召集项目的志愿者和开发者。由于众所周知的原因，基金会目前以匿名方式开展工作，无法做出保证项目成功的任何承若。参与者只能通过对项目愿景的了解，以及对实现愿景的智能合约和非智能合约手段进行审查，谨慎判断项目风险。本轮通过拍卖募集的资金主要用于技术维护，包括智能合约的测试、安全审计，为参与者提供便利操作的网站以及第三方身份认证接口等。参与者拍卖所得项目通证GAZ，目前只能作为参与项目的保证金，不能自由交易
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  import Web3 from "web3"
  import AuctionAbi from "../dotc/auction"
  import USDTAbi from "../dotc/usdt"
  import TimeFormater from "time-formater"

  let web3 = web3
  if (typeof ethereum !== 'undefined') {
    web3 = new Web3(ethereum)
  } else if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider)
  } else {
    alert("please install metamask first")
  }

  let account_address = ""
  let auction_address = "0x8620ba21505AB542E397b6778ddFB6F0aD1b9CEd"//"0x50968190b1B0b17A726090c12D8555e774BfA689"
  let auction = new web3.eth.Contract(AuctionAbi, auction_address)
  let usdt = new web3.eth.Contract(USDTAbi, "0xdac17f958d2ee523a2206206994597c13d831ec7")

  let depi, Tem, timb, low, sp, total, balanc, step, Tima, gross, intv, gaz

  function fromWei(value) {
    return parseFloat(web3.utils.fromWei(value, 'ether'))
  }

  function toWei(value) {
    return web3.utils.toWei(value, 'ether')
  }

  function toUsdt(value) {
    return web3.utils.toBN(value * Math.pow(10, 6))
  }

  function fromUsdt(value) {
    return value / Math.pow(10, 6)
  }

  export default {
    created() {
      eventBus.$on("auction_info", (i, key, value) => {
        this.auction_info[i][key] = value
      })
      eventBus.$on("key", (key, value) => {
        this[key] = value
      })
      eventBus.$on("refreash", () => {
        this.auction_info.forEach(v => {
          v.left_value = '...'
          v.right_value = '...'
        })
        this.remain_time = '...'
        // 拍卖轮次
        auction.methods.depi().call(null, make_callback("depi"))
        // 加价幅度
        auction.methods.step().call(null, make_callback("step"))
        // 拍卖周期
        auction.methods.Tima().call(null, make_callback("Tima"))
        // 剩余量
        auction.methods.balanc().call(null, make_callback("balanc"))
      })

      function make_callback(name) {
        return function (error, result) {
          if (error) {
            console.error(error)
            debugger
          }
          handle_callback(name, result)
        }
      }

      function handle_callback(name, value) {
        switch (name) {
          case "depi": {
            depi = value
            eventBus.$emit("auction_info", 0, "left_value", depi)
            // 锁仓周期
            auction.methods.Tem(depi).call(null, make_callback("Tem"))
            // 目前最低价
            auction.methods.low().call(null, make_callback("low"))
            // 起拍价
            auction.methods.sp(depi).call(null, make_callback("sp"))
            // 竞拍总量
            auction.methods.total(depi).call(null, make_callback("total"))
          }
          break
          case "Tem": {
            Tem = Math.floor(value)
            eventBus.$emit("auction_info", 4, "right_value", (Tem / 3600 / 24).toFixed(1) + "天")
          }
          break
          case "timb": {
            timb = Math.floor(value)
            clearInterval(intv)
            intv = setInterval(() => {
              eventBus.$emit("key", "remain_time", TimeFormater.countdown(Tima - (Date.now() / 1000 - timb)).format("d天H时m分s秒"))
            }, 1000)
          }
          break
          case "low": {
            low = fromUsdt(value)
            eventBus.$emit("auction_info", 2, "right_value", `${low.toFixed(2)} USDT`)
            ethereum.enable().then(result => {
              web3.eth.getAccounts().then(accounts => {
                console.log(accounts)
                account_address = accounts[0]
                eventBus.$emit("key", "auction_enabled", true)
                // 代币余额
                auction.methods.balanceOf(account_address).call(null, make_callback("balanceOf"))
              })
            })
            // 最低价持有量
            auction.methods.gross(depi, value).call(null, make_callback("gross"))
          }
          break
          case "gross": {
            gross = fromWei(value)
            eventBus.$emit("auction_info", 3, "right_value", `${gross.toFixed(2)} GAZ`)
          }
          break
          case "sp": {
            sp = fromUsdt(value)
            eventBus.$emit("auction_info", 0, "right_value", `${sp.toFixed(2)} USDT`)
          }
          break
          case "total": {
            total = fromWei(value)
            eventBus.$emit("auction_info", 1, "left_value", `${total.toFixed(2)} GAZ`)
            eventBus.$emit("auction_info", 2, "left_value", `${(total / 66666666 * 100).toFixed(2)}%`)
          }
          break
          case "balanc": {
            balanc = fromWei(value)
            eventBus.$emit("auction_info", 3, "left_value", `${balanc.toFixed(2)} GAZ`)
          }
          break
          case "step": {
            step = fromUsdt(value)
            eventBus.$emit("auction_info", 1, "right_value", `${step.toFixed(2)} USDT`)
          }
          break
          case "Tima": {
            Tima = Math.floor(value)
            eventBus.$emit("auction_info", 4, "left_value", (Tima / 3600 / 24).toFixed(1) + "天")
            // 用于计算剩余时间
            auction.methods.timb().call(null, make_callback("timb"))
          }
          case "balanceOf": {
            gaz = fromWei(value)
            eventBus.$emit("key", "gaz_balance", gaz)
          }
        }
      }
      eventBus.$emit("refreash")
      // 监听拍卖事件
      auction.events.Transfer({ fromBlock: "latest" }, (error, event) => {
        console.log("收到Transfer事件回调", event)
        // alert(`用户${event.returnValues.ust}竞拍成功，将刷新界面`)
        eventBus.$emit("refreash")
      })
    },
    methods: {
      async purchase() {
        this.auction_enabled = false
        function checkUSDTAuth() {
          return new Promise((resolve, reject) => {
            usdt.methods.allowance(account_address, auction_address).call((error, value) => {
              if (error) {
                reject(error)
              } else {
                console.log("checkUSDTAuth() =", fromUsdt(value))
                resolve(fromUsdt(value))
              }
            })
          })
        }
        function auth(low) {
          return new Promise((resolve, reject) => {
            usdt.methods.approve(auction_address, toUsdt(low)).send({from: account_address}, (error, value) => {
              if (error) {
                reject(error)
              } else {
                usdt.once("Approval", { fromBlock: "latest" }, (error, event) => {
                  console.log("收到Approval事件回调", event)
                  alert("授权成功，开始发起竞拍")
                  resolve(value)
                })
                console.log(`auth(${toUsdt(low)}) = ${value}`)
              }
            })
          })
        }
        function auctionGaz(offer, num) {
          return new Promise((resolve, reject) => {
            auction.methods.auction(toWei(num), toUsdt(offer)).send({from: account_address}, (error, value) => {
              if (error) {
                reject(error)
              } else {
                console.log(`auctionGaz(${offer}, ${num}) = ${value}`)
                resolve(value)
              }
            })
          })
        }
        function checkUserGross(offer) {
          return new Promise((resolve, reject) => {
            auction.methods.check(depi, toUsdt(offer)).call((error, value) => {
              if (error) {
                reject(error)
              } else {
                console.log(`checkUserGross(${offer}) = ${fromWei(value)}`)
                resolve(fromWei(value))
              }
            })
          })
        }
        let enabled = true
        if (this.form.gross == 0) {
          alert("数量需要大于0")
        } else if (balanc > 0 && this.form.low < low) {
          alert("出价不能低于" + low + " USDT")
        } else if (balanc == 0 && this.form.low <= low) {
          alert("出价需大于" + low + " USDT")
        } else {
          let max_gross = balanc
          if (this.form.low > low) {
            max_gross += await checkUserGross(this.form.low)
          }
          if (this.form.gross > max_gross) {
            alert("数量不能多于: " + max_gross.toFixed(2) + " GAZ")
          } else {
            let auth_num = await checkUSDTAuth()
            let require_num = this.form.low * this.form.gross
            if (auth_num < require_num) {
              alert("USDT合约还未进行授权或授权数额不够，要先授权才能进行转账操作")
              if (auth_num > 0) {
                // USDT授权的时候如果还存在授权余额就需要先清零
                let hash = await auth(0).catch(console.log)
                if (! hash) {
                  alert("授权失败")
                  this.auction_enabled = enabled
                  return
                }
              }
              let hash = await auth(require_num * 10).catch(console.log)
              if (! hash) {
                alert("授权失败")
                this.auction_enabled = enabled
                return
              }
            }
            let hash = await auctionGaz(this.form.low, this.form.gross).catch(error => {
              console.log(error)
            })
            if (hash) {
              alert("竞拍成功，ID为" + hash + "，等待确认后将自动刷新界面")
              enabled = false
            } else {
              alert("竞拍失败")
            }
          }
        }
        this.auction_enabled = enabled
      },
      query() {
        if (account_address == '') {
          return
        }
        auction.methods.balanceOf(account_address).call(null, (error, result) => {
          gaz = fromWei(result)
          this.gaz_balance = gaz
        })
      }
    },
    data() {
      return {
        auction_info: [
          {
            left_title: "拍卖轮次",
            left_value: "...",
            right_title: "起拍价",
            right_value: "..."
          },
          {
            left_title: "拍卖总量",
            left_value: "...",
            right_title: "加价幅度",
            right_value: "..."
          },
          {
            left_title: "总量占比",
            left_value: "...",
            right_title: "目前最低价",
            right_value: "..."
          },
          {
            left_title: "剩余量",
            left_value: "...",
            right_title: "最低价持有量",
            right_value: "..."
          },
          {
            left_title: "拍卖周期",
            left_value: "...",
            right_title: "锁仓周期",
            right_value: "..."
          },
        ],
        form: {
          low: 0,
          gross: 0
        },
        auction_enabled: false,
        // 剩余时间
        remain_time: "...",
        // GAZ余额查询
        gaz_balance: 0
      }
    }
  }
</script>

<style>
  .header-col-left {
    /* background-color: aquamarine; */
    height: 10rem;
  }

  .header-col-right {
    /* background-color: bisque; */
    height: 10rem;
    text-align: left;
    font-size: 13px;
    padding-top: 2.5rem;
    padding-left: 2rem;
  }

  .title {
    width: 94%;
    height: 3rem;
    background-color: #e3e8ee;
    margin-left: 3%;
  }

  .auction {
    /* background-color: cadetblue; */
    /* height: 12rem; */
    width: 100%;
    font-size: 10px;
    margin-top: 20px;
    text-align: center;
  }

  .draw {
    background-color: cadetblue;
  }

  .auction .van-row {
    margin-top: 15px;
    text-align: left;
  }

  .control {
    margin-top: 1rem;
    background-color: #eff2f5;
  }

  .input {
    font-size: 11px;
    margin-top: 5px;
    line-height: 3rem;
  }

  .input .van-col {
    text-align: left;
  }

  .operator {
    /* background-color:chocolate; */
    font-size: 11px;
    padding-top: 1.3rem;
    line-height: 30px;
  }

  .query {
    width: 100%;
    height: 3rem;
    margin-top: 10px;
    /* background-color: chocolate; */
  }

  .query .van-col {
    line-height: 3rem;
    text-align: left;
  }

  .rule {
    margin-top: 10px;
    padding-left: 15px;
    font-size: 13px;
    /* background-color: chocolate; */
  }

  .rule h4 {
    color: blue;
    font-size: 15px;
  }

  .warning {
    margin-top: 10px;
    margin-bottom: 10px;
    padding-left: 15px;
    font-size: 13px;
    color: red;
    /* background-color: chocolate; */
  }

  .warning h4 {
    font-size: 15px;
  }

  .van-row {
    text-align: center;
  }
</style>
