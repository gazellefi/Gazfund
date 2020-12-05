
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
            <el-col :span="16"><el-input v-model="form.low" placeholder="请输入内容"></el-input></el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="8">数量</el-col>
            <el-col :span="16"><el-input v-model="form.gross" placeholder="请输入内容"></el-input></el-col>
          </el-row>
          <el-button type="primary" @click="purchase" :disabled="this.jugle.low == null" plain>购买</el-button>
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
  import Dayjs from "dayjs"

  if (typeof ethereum === 'undefined') {
    alert("please install metamask first")
  }

  let web3 = new Web3(ethereum)
  let auction = new web3.eth.Contract(AuctionAbi, "0xAe8501ff3F4d22E08B3D6d11575D0f54Cf35EbaC")

  export default {
    created() {
      eventBus.$on("auction_info", (i, key, value) => {
        this.auction_info[i][key] = value
      })
      eventBus.$on("remain_time", (value) => {
        this.remain_time = value
      })
      eventBus.$on("jugle", (key, value) => {
        this.jugle[key] = value
        this.form[key] = value
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

      let depi, Tem, timb, low, sp, total, balanc, step, Tima, gross
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
            Tem = value
            eventBus.$emit("auction_info", 4, "right_value", (Tem / 3600 / 60).toFixed(1) + '天')
            // 用于计算剩余时间
            auction.methods.timb().call(null, make_callback("timb"))
          }
          break
          case "timb": {
            timb = value
            eventBus.$emit("remain_time", Dayjs.unix(Tem - (Date.now() / 1000 - timb)).format("hh:mm:ss"))
          }
          break
          case "low": {
            low = value
            eventBus.$emit("jugle", "low", (low / Math.pow(10, 18)).toFixed(2))
            eventBus.$emit("auction_info", 2, "right_value", `${(low / Math.pow(10, 18)).toFixed(2)} USDT`)
            // 最低价持有量
            auction.methods.gross(depi, low).call(null, make_callback("gross"))
          }
          break
          case "gross": {
            gross = value
            eventBus.$emit("jugle", "gross", (gross / Math.pow(10, 18)).toFixed(2))
            eventBus.$emit("auction_info", 3, "right_value", `${(gross / Math.pow(10, 18)).toFixed(2)} GAZ`)
          }
          break
          case "sp": {
            sp = value
            eventBus.$emit("auction_info", 0, "right_value", `${(sp / Math.pow(10, 18)).toFixed(2)} USDT`)
          }
          break
          case "total": {
            total = value
            eventBus.$emit("auction_info", 1, "left_value", `${(total / Math.pow(10, 18)).toFixed(2)} GAZ`)
            // 剩余量
            auction.methods.balanc().call(null, make_callback("balanc"))
          }
          break
          case "balanc": {
            balanc = value
            eventBus.$emit("auction_info", 3, "left_value", `${(balanc / Math.pow(10, 18)).toFixed(2)} GAZ`)
            eventBus.$emit("auction_info", 2, "left_value", `${(balanc / total * 100).toFixed(2)}%`)
          }
          break
          case "step": {
            step = value
            eventBus.$emit("auction_info", 1, "right_value", `${(step / Math.pow(10, 18)).toFixed(2)} USDT`)
          }
          break
          case "Tima": {
            Tima = value
            eventBus.$emit("auction_info", 4, "left_value", (Tima / 3600).toFixed(1) + '小时')
          }
        }
      }
      // 拍卖轮次
      auction.methods.depi().call(null, make_callback("depi"))
      // 加价幅度
      auction.methods.step().call(null, make_callback("step"))
      // 拍卖周期
      auction.methods.Tima().call(null, make_callback("Tima"))
    },
    methods: {
      purchase() {
        if (this.form.offer < this.jugle.low) {
          alert("出价不能低于当前最低出价值: " + this.jugle.low + " USDT")
        }

      }
    },
    watch: {
      "form.offer": {
        handler(new_value, old_value) {
          console.log('change')
        },
        deep: true
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
        jugle: {
          low: null,
          gross: null
        },
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
