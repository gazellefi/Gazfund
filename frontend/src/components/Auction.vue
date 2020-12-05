
<template>
  <div>
    <el-container>
      <el-header>本轮拍卖信息</el-header>
      <el-container>
        <el-main>
          <el-row :gutter="20" v-for="(info, i) in auction_info" v-bind:key="i">
            <el-col :span="6">{{ info.left_title }}</el-col>
            <el-col :span="7">{{ info.left_value }}</el-col>
            <el-col :span="6">{{ info.right_title }}</el-col>
            <el-col :span="5">{{ info.right_value }}</el-col>
          </el-row>
        </el-main>
        <el-aside width="220px">
          <el-row :gutter="0">
            <el-col :span="8">出价</el-col>
            <el-col :span="16"><el-input v-model="form.offer" placeholder="请输入内容"></el-input></el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="8">数量</el-col>
            <el-col :span="16"><el-input v-model="form.amount" placeholder="请输入内容"></el-input></el-col>
          </el-row>
          <el-button type="primary" plain>购买</el-button>
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
    console.log("please install metamask")
  }

  let web3 = new Web3(ethereum)
  let auction = new web3.eth.Contract(AuctionAbi, "0x9610e09ac42d130a8f62aeb9cef1238b5a6b6a65")

  export default {
    created() {
      eventBus.$on("auction_info", (i, key, value) => {
        this.auction_info[i][key] = value
      })
      eventBus.$on("remain_time", (value) => {
        this.remain_time = value
      })
      // 拍卖轮次
      auction.methods.depi().call(null, function (error, depi) {
        eventBus.$emit("auction_info", 0, "left_value", depi)
        // 竞拍周期
        auction.methods.Tem(depi).call(null, function (error, Tem) {
          let result = (Tem / 3600 / 60).toFixed(1) + '天'
          eventBus.$emit("auction_info", 4, "right_value", result)
          // 剩余竞拍时间
          auction.methods.timb().call(null, function (error, timb) {
            timb = Dayjs.unix(Tem - (Date.now() / 1000 - timb)).format("hh:mm:ss")
            eventBus.$emit("remain_time", timb)
          })
        })
        // 最低价
        auction.methods.low().call(null, function (error, low) {
          low = `${(low / Math.pow(10, 18)).toFixed(2)} GAZ`
          eventBus.$emit("auction_info", 2, "right_value", low)
        })
      })
      auction.methods.balanc().call(null, function (error, balanc) {
        balanc = `${(balanc / Math.pow(10, 18)).toFixed(2)} GAZ`
        eventBus.$emit("auction_info", 1, "left_value", balanc)
      })
      auction.methods.step().call(null, function (error, step) {
        step = `${(step / Math.pow(10, 18)).toFixed(2)} GAZ`
        eventBus.$emit("auction_info", 1, "right_value", step)
      })
      auction.methods.Tima().call(null, function (error, Tima) {
        Tima = (Tima / 3600).toFixed(1) + '小时'
        eventBus.$emit("auction_info", 4, "left_value", Tima)
      })
    },
    methods: {
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
            left_value: "1%",
            right_title: "目前最低价",
            right_value: "..."
          },
          {
            left_title: "剩余量",
            left_value: "0",
            right_title: "最低价持有量",
            right_value: "125,555"
          },
          {
            left_title: "拍卖周期",
            left_value: "...",
            right_title: "锁仓周期",
            right_value: "..."
          },
        ],
        form: {
          offer: 0,
          amount: 0
        },
        formInline: {
          user: '',
          region: ''
        },
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
