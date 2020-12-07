
<template>
  <div>
    <el-container>
      <el-header>本轮拍卖信息</el-header>
      <el-container>
        <el-main>
          <el-row :gutter="20" v-for="(info, i) in auction_info" v-bind:key="i">
            <el-col :span="4">{{ info.left_title }}</el-col>
            <el-col :span="7">{{ info.left_value }}</el-col>
            <el-col :span="6">{{ info.right_title }}</el-col>
            <el-col :span="7">{{ info.right_value }}</el-col>
          </el-row>
        </el-main>
        <el-aside width="220px">
          <el-row :gutter="0">
            <el-col :span="8">出价</el-col>
            <el-col :span="10"><el-input v-model="form.low" placeholder="请输入内容"></el-input></el-col>
            <el-col :span="6" style="text-align: left; padding-left: 5px;">USDT</el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="8">数量</el-col>
            <el-col :span="10"><el-input v-model="form.gross" placeholder="请输入内容"></el-input></el-col>
            <el-col :span="6" style="text-align: left; padding-left: 5px;">GAZ</el-col>
          </el-row>
          <el-button type="primary" @click="purchase" :disabled="auction_enabled == false" plain>购买</el-button>
          <div>剩余时间：{{ remain_time }}</div>
        </el-aside>
      </el-container>
      <el-footer height="15rem">风险说明</el-footer>
    </el-container>
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
  let auction_address = "0xeCe84639f95a00bb54682aD54Bd91cDDe71bF0A6"
  let auction = new web3.eth.Contract(AuctionAbi, auction_address)
  let usdt = new web3.eth.Contract(USDTAbi, "0x055ca37302a360cba1774f1b286d163ea6480a87")

  let depi, Tem, timb, low, sp, total, balanc, step, Tima, gross

  export default {
    created() {
      eventBus.$on("auction_info", (i, key, value) => {
        this.auction_info[i][key] = value
      })
      eventBus.$on("key", (key, value) => {
        this[key] = value
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
            setInterval(() => {
              eventBus.$emit("key", "remain_time", TimeFormater.countdown(Tima - (Date.now() / 1000 - timb)).format("d天H时m分s秒"))
            }, 1000)
          }
          break
          case "low": {
            low = value / Math.pow(10, 18)
            eventBus.$emit("auction_info", 2, "right_value", `${low.toFixed(2)} USDT`)
            ethereum.enable().then(result => {
              web3.eth.getAccounts().then(accounts => {
                console.log(accounts)
                account_address = accounts[0]
                eventBus.$emit("key", "auction_enabled", true)
              })
            })
            // 最低价持有量
            auction.methods.gross(depi, value).call(null, make_callback("gross"))
          }
          break
          case "gross": {
            gross = value / Math.pow(10, 18)
            eventBus.$emit("auction_info", 3, "right_value", `${gross.toFixed(2)} GAZ`)
          }
          break
          case "sp": {
            sp = value / Math.pow(10, 18)
            eventBus.$emit("auction_info", 0, "right_value", `${sp.toFixed(2)} USDT`)
          }
          break
          case "total": {
            total = value / Math.pow(10, 18)
            eventBus.$emit("auction_info", 1, "left_value", `${total.toFixed(2)} GAZ`)
            eventBus.$emit("auction_info", 2, "left_value", `${(total / 66666666 * 100).toFixed(2)}%`)
          }
          break
          case "balanc": {
            balanc = value / Math.pow(10, 18)
            eventBus.$emit("auction_info", 3, "left_value", `${balanc.toFixed(2)} GAZ`)
          }
          break
          case "step": {
            step = value / Math.pow(10, 18)
            eventBus.$emit("auction_info", 1, "right_value", `${step.toFixed(2)} USDT`)
          }
          break
          case "Tima": {
            Tima = Math.floor(value)
            eventBus.$emit("auction_info", 4, "left_value", (Tima / 3600 / 24).toFixed(1) + "天")
            // 用于计算剩余时间
            auction.methods.timb().call(null, make_callback("timb"))
          }
        }
      }
      // 拍卖轮次
      auction.methods.depi().call(null, make_callback("depi"))
      // 加价幅度
      auction.methods.step().call(null, make_callback("step"))
      // 拍卖周期
      auction.methods.Tima().call(null, make_callback("Tima"))
      // 剩余量
      auction.methods.balanc().call(null, make_callback("balanc"))
      // 监听拍卖事件
      auction.events.Auction({ fromBlock: "latest" }, (error, event) => {
        console.log("收到时间回调", event)
        alert(`用户${event.returnValues.ust}竞拍成功，将刷新界面`)
        location.reload()
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
                resolve(value / Math.pow(10, 18))
              }
            })
          })
        }
        function auth(low) {
          return new Promise((resolve, reject) => {
            usdt.methods.approve(auction_address, web3.utils.toBN(low)).send({from: account_address}, (error, value) => {
              if (error) {
                reject(error)
              } else {
                console.log("auth result", value)
                resolve(value)
              }
            })
          })
        }
        function auctionGaz(offer, num) {
          return new Promise((resolve, reject) => {
            auction.methods.auction(web3.utils.toBN(num), web3.utils.toBN(offer)).send({from: account_address}, (error, value) => {
              if (error) {
                reject(error)
              } else {
                console.log("auctionGaz result", value)
                resolve(value)
              }
            })
          })
        }
        function checkUserGross(num) {
          return new Promise((resolve, reject) => {
            auction.methods.check(depi, web3.utils.toBN(num)).call((error, value) => {
              if (error) {
                reject(error)
              } else {
                console.log(`checkUserGross(${num}) = ${value}`)
                resolve(value / Math.pow(10, 18))
              }
            })
          })
        }
        let enabled = true
        if (this.form.low == 0 || this.form.gross == 0) {
          alert("出价和数量都需要大于0")
        } else {
          let max_gross = balanc
          if (this.form.low > low) {
            max_gross += await checkUserGross(this.form.low * Math.pow(10, 18))
          }
          if (this.form.gross > max_gross) {
            alert("数量不能多于: " + max_gross.toFixed(2) + " GAZ")
          } else {
            let auth_num = await checkUSDTAuth()
            let require_num = this.form.low * this.form.gross
            if (auth_num < require_num) {
              alert("USDT合约还未进行授权或授权数额不够，要先授权才能进行转账操作")
              await auth(require_num * Math.pow(10, 18))
            }
            let hash = await auctionGaz(this.form.low * Math.pow(10, 18), this.form.gross * Math.pow(10, 18)).catch(error => {
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
        remain_time: "..."
      }
    }
  }
</script>

<style>
  .el-header {
    background-color: #e3e8ee;
    /* color: #333; */
    /* text-align: center; */
    line-height: 60px;
  }
  
  .el-footer {
    background-color: #FFFFFF;
    border-radius: 5px;
    border: 1px solid;
  }

  .el-aside {
    /* background-color: #D3DCE6; */
    /* color: #333; */
    text-align: center;
    padding-top: 2rem;
    /* border-left: 1px solid; */
  }
  
  .el-main {
    /* background-color: #e8ecf0; */
    color: #333;
    /* text-align: center; */
    /* line-height: 160px; */
    height: 15rem;
  }
  
  body .el-container {
    width: 50rem;
    margin: 0 auto;
  }

  .el-aside .el-row {
    height: 40px;
  }

  .el-aside .el-col {
    text-align: center;
    line-height: 45px;
  }

  .el-aside .el-button {
    width: 90px;
    margin-bottom: 0.5rem;
  }

  .el-row {
    margin-bottom: 19px;
  }

  .el-col {
    border-radius: 4px;
    text-align: left;
  }
</style>
