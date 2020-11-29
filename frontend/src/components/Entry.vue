
<template>
  <div>
    <el-container>
      <el-header style="height: 70px">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-row>
              <el-button type="info" plain>购买</el-button>
              <el-button type="warning" plain>出售</el-button>
            </el-row>
          </el-col>
          <el-col :span="6">
            <el-row>
              <el-dropdown>
                <el-button type="primary">
                  USDT<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>BTC</el-dropdown-item>
                  <el-dropdown-item>ETH</el-dropdown-item>
                  <el-dropdown-item>EOS</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown>
                <el-button type="primary">
                  CNY<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>USD</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-row>
          </el-col>
          <el-col :span="12">
            <div class="grid-content">
              <el-button type="info" plain>发布委托订单</el-button>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName">
          <el-table-column prop="maker" label="商家" width="300">
          </el-table-column>
          <el-table-column prop="order" label="订单号" width="200">
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="200">
          </el-table-column>
          <el-table-column prop="limit" label="限额" width="300">
          </el-table-column>
          <el-table-column prop="unit" label="单价" width="200">
          </el-table-column>
          <el-table-column prop="bond" label="保证金要求" width="200">
          </el-table-column>
          <el-table-column prop="contact" label="联系方式" width="200">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="props">
              <el-button @click="handleClick(props.row)">购买 USDT</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    methods: {
      tableRowClassName({row, rowIndex}) {
        if (rowIndex === 1) {
          return 'warning-row';
        } else if (rowIndex === 3) {
          return 'success-row';
        }
        return '';
      }
    },
    data() {
      return {
        tableData: [{
          maker: '小猪佩奇',
          order: '113',
          quantity: '272.24 USDT',
          limit: '666.00-1,734.16',
          unit: '6.37 CNY',
          bond: '5%',
          contact: '',
          operator: ''
        }]
      }
    }
  }
</script>

<style>
  .el-header {
    background-color: #e7ecf1;
    padding-top: 12.5px;
  }
  
  .el-main {
    /* background-color: #E9EEF3; */
    color: #333;
    text-align: center;
    /* line-height: 160px; */
  }
  
  .el-container {
    height: 100%;
  }

  .grid-content {
    min-height: 45px;
    text-align: right;
  }

  .grid-content > .el-button {
    margin-right: 30px;
  }

  .row-bg {
    padding: 10px 0;
    /* background-color: #f9fafc; */
  }

  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>