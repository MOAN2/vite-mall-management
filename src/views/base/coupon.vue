<template>
    <div class="coupon-container">
      <div class="header">
        <h2>优惠券管理</h2>
        <el-button type="primary" @click="handleAdd">新增优惠券</el-button>
      </div>
  
      <!-- 表格区域 -->
      <el-table stripe :data="tableData" border style="width: 100%" v-loading="loading" fit>
        <el-table-column prop="couponId" label="优惠券ID" min-width="100" />
        <el-table-column prop="couponName" label="优惠券名称" min-width="150" />
        <el-table-column label="发放状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.issueStatus === 'issuing' ? 'success' : scope.row.issueStatus === 'ready' ? 'info' : 'warning'">
              {{ 
                scope.row.issueStatus === 'issuing' ? '发放中' : 
                scope.row.issueStatus === 'ready' ? '待发放' : 
                scope.row.issueStatus === 'ended' ? '已结束' : '-'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="库存" min-width="80">
          <template #default="scope">
            <span>{{ scope.row.stock !== undefined ? scope.row.stock : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" min-width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isEnabled"
              @change="handleStatusChange(scope.row)"
              :disabled="scope.row.issueStatus === 'ended'"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170">
          <template #default="scope">
            {{ scope.row.createdAt ? formatDate(scope.row.createdAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 新增/编辑弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增优惠券' : '编辑优惠券'"
        width="550px"
        center
      >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="优惠券名称" prop="couponName">
            <el-input v-model="form.couponName" placeholder="请输入优惠券名称" />
          </el-form-item>
          <el-form-item label="发放状态" prop="issueStatus">
            <el-select v-model="form.issueStatus" placeholder="请选择发放状态" style="width: 100%">
              <el-option label="发放中" value="issuing" />
              <el-option label="待发放" value="ready" />
              <el-option label="已结束" value="ended" />
            </el-select>
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="form.stock" :min="0" :precision="0" style="width: 100%" placeholder="请输入库存数量" />
          </el-form-item>
          <el-form-item label="启用状态" prop="isEnabled">
            <el-switch v-model="form.isEnabled" :disabled="form.issueStatus === 'ended'" />
            <span class="status-tip" v-if="form.issueStatus === 'ended'">已结束的优惠券不能启用</span>
          </el-form-item>
          <el-form-item label="优惠金额" prop="amount">
            <el-input-number 
              v-model="form.amount" 
              :min="0.01" 
              :precision="2" 
              :step="1" 
              style="width: 100%" 
              placeholder="请输入优惠金额" 
            />
          </el-form-item>
          <el-form-item label="使用门槛" prop="threshold">
            <el-input-number 
              v-model="form.threshold" 
              :min="0" 
              :precision="2" 
              :step="10" 
              style="width: 100%" 
              placeholder="请输入使用门槛，0表示无门槛" 
            />
          </el-form-item>
          <el-form-item label="有效期" required>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item prop="startDate">
                  <el-date-picker
                    v-model="form.startDate"
                    type="date"
                    placeholder="开始日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="endDate">
                  <el-date-picker
                    v-model="form.endDate"
                    type="date"
                    placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="使用说明" prop="instructions">
            <el-input
              v-model="form.instructions"
              type="textarea"
              :rows="3"
              placeholder="请输入使用说明"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import dayjs from 'dayjs';
  import * as api from '@/api/base.js'
  // 格式化日期函数
  const formatDate = (date) => {
    return dayjs(date).format('YYYY/MM/DD HH:mm');
  };
  
  // 表格数据
  const tableData = ref([]);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  
  // 弹窗相关
  const dialogVisible = ref(false);
  const dialogType = ref('add'); // 'add' 或 'edit'
  const formRef = ref(null);
  const form = reactive({
    couponId: null,
    couponName: '',
    issueStatus: 'ready',
    stock: 100,
    isEnabled: true,
    amount: 10,
    threshold: 0,
    startDate: null,
    endDate: null,
    instructions: ''
  });
  
  // 表单验证规则
  const rules = {
    couponName: [
      { required: true, message: '请输入优惠券名称', trigger: 'blur' },
      { min: 2, max: 30, message: '长度在 2 到 30 个字符之间', trigger: 'blur' }
    ],
    issueStatus: [
      { required: true, message: '请选择发放状态', trigger: 'change' }
    ],
    stock: [
      { required: true, message: '请输入库存数量', trigger: 'blur' }
    ],
    amount: [
      { required: true, message: '请输入优惠金额', trigger: 'blur' }
    ],
    startDate: [
      { type: 'date', required: true, message: '请选择开始日期', trigger: 'change' }
    ],
    endDate: [
      { type: 'date', required: true, message: '请选择结束日期', trigger: 'change' }
    ]
  };
  
  // 生成模拟数据
  const generateMockData = (page, limit) => {
    const mockData = [];
    const offset = (page - 1) * limit;
    const count = Math.min(limit, 100 - offset);
    
    const couponTypes = [
      '满减券', '折扣券', '新人券', '会员券', '节日券', '活动券'
    ];
    
    const issueStatuses = ['issuing', 'ready', 'ended'];
    
    for (let i = 0; i < count; i++) {
      // 随机生成优惠券类型和金额
      const couponType = couponTypes[Math.floor(Math.random() * couponTypes.length)];
      const amount = Math.floor(Math.random() * 50) + 5; // 5-55元的优惠金额
      const threshold = Math.random() > 0.3 ? Math.floor(amount * (Math.random() * 5 + 1)) : 0; // 70%概率有门槛
      
      // 随机生成有效期
      const now = new Date();
      const startDate = new Date(now.getTime() - Math.floor(Math.random() * 30) * 86400000);
      const endDate = new Date(now.getTime() + Math.floor(Math.random() * 90) * 86400000);
      
      // 随机生成发放状态
      const issueStatus = issueStatuses[Math.floor(Math.random() * issueStatuses.length)];
      
      // 根据发放状态决定库存和启用状态
      let stock = Math.floor(Math.random() * 1000);
      let isEnabled = Math.random() > 0.2; // 80%概率启用
      
      if (issueStatus === 'ended') {
        stock = Math.floor(Math.random() * 10); // 已结束的优惠券库存较少
        isEnabled = false; // 已结束的优惠券不能启用
      }
      
      mockData.push({
        couponId: `CPN${10000 + offset + i}`,
        couponName: `${amount}元${couponType}${threshold > 0 ? `(满${threshold}元可用)` : ''}`,
        issueStatus: issueStatus,
        stock: stock,
        isEnabled: isEnabled,
        amount: amount,
        threshold: threshold,
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date(startDate.getTime() - Math.floor(Math.random() * 10) * 86400000),
        instructions: threshold > 0 
          ? `使用说明：\n1. 订单满${threshold}元可使用\n2. 不可与其他优惠券叠加使用\n3. 有效期${dayjs(startDate).format('YYYY/MM/DD')}至${dayjs(endDate).format('YYYY/MM/DD')}`
          : `使用说明：\n1. 无使用门槛\n2. 不可与其他优惠券叠加使用\n3. 有效期${dayjs(startDate).format('YYYY/MM/DD')}至${dayjs(endDate).format('YYYY/MM/DD')}`
      });
    }
    
    return {
      code: 0,
      message: '',
      data: {
        totalCount: 100,
        pageNo: page,
        pageSize: limit,
        dataList: mockData
      },
      success: true
    };
  };
  
  // 加载表格数据
  const loadTableData = () => {
    loading.value = true;
    
    // 模拟接口请求
    setTimeout(() => {
      const res = generateMockData(currentPage.value, pageSize.value);
      if (res.success) {
        tableData.value = res.data.dataList;
        total.value = res.data.totalCount;
      } else {
        ElMessage.error(res.message || '获取数据失败');
      }
      loading.value = false;
    }, 500);
  };
  
  // 页码变化
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    loadTableData();
  };
  
  // 每页条数变化
  const handleSizeChange = (val) => {
    pageSize.value = val;
    loadTableData();
  };
  
  // 启用状态变更
  const handleStatusChange = (row) => {
    if (row.issueStatus === 'ended') {
      row.isEnabled = false;
      ElMessage.warning('已结束的优惠券不能启用');
      return;
    }
    
    const statusText = row.isEnabled ? '启用' : '停用';
    ElMessage.success(`优惠券"${row.couponName}"已${statusText}`);
  };
  
  // 新增优惠券
  const handleAdd = () => {
    dialogType.value = 'add';
    const now = new Date();
    Object.assign(form, {
      couponId: null,
      couponName: '',
      issueStatus: 'ready',
      stock: 100,
      isEnabled: true,
      amount: 10,
      threshold: 0,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 86400000), // 默认30天有效期
      instructions: ''
    });
    dialogVisible.value = true;
  };
  
  // 编辑优惠券
  const handleEdit = (row) => {
    dialogType.value = 'edit';
    Object.assign(form, {
      couponId: row.couponId,
      couponName: row.couponName,
      issueStatus: row.issueStatus,
      stock: row.stock,
      isEnabled: row.isEnabled,
      amount: row.amount,
      threshold: row.threshold,
      startDate: row.startDate,
      endDate: row.endDate,
      instructions: row.instructions
    });
    dialogVisible.value = true;
  };
  
  // 删除优惠券
  const handleDelete = (row) => {
    ElMessageBox.confirm(
      `确定要删除优惠券"${row.couponName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 实际项目中这里需要调用接口删除数据
      const index = tableData.value.findIndex(item => item.couponId === row.couponId);
      if (index !== -1) {
        tableData.value.splice(index, 1);
        ElMessage.success('删除成功');
      }
    }).catch(() => {
      // 取消删除
    });
  };
  
  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate((valid) => {
      if (valid) {
        // 验证结束日期是否晚于开始日期
        if (form.endDate <= form.startDate) {
          ElMessage.error('结束日期必须晚于开始日期');
          return;
        }
        
        // 如果状态为已结束，则强制设置为禁用状态
        if (form.issueStatus === 'ended') {
          form.isEnabled = false;
        }
        
        if (dialogType.value === 'add') {
          // 新增优惠券
          const newCoupon = {
            couponId: `CPN${Math.floor(Math.random() * 90000) + 10000}`,
            couponName: form.couponName,
            issueStatus: form.issueStatus,
            stock: form.stock,
            isEnabled: form.isEnabled,
            amount: form.amount,
            threshold: form.threshold,
            startDate: form.startDate,
            endDate: form.endDate,
            createdAt: new Date(),
            instructions: form.instructions
          };
          
          tableData.value.unshift(newCoupon);
          ElMessage.success('新增成功');
        } else {
          // 编辑优惠券
          const index = tableData.value.findIndex(item => item.couponId === form.couponId);
          if (index !== -1) {
            tableData.value[index].couponName = form.couponName;
            tableData.value[index].issueStatus = form.issueStatus;
            tableData.value[index].stock = form.stock;
            tableData.value[index].isEnabled = form.isEnabled;
            tableData.value[index].amount = form.amount;
            tableData.value[index].threshold = form.threshold;
            tableData.value[index].startDate = form.startDate;
            tableData.value[index].endDate = form.endDate;
            tableData.value[index].instructions = form.instructions;
            ElMessage.success('更新成功');
          }
        }
        
        dialogVisible.value = false;
      }
    });
  };
  
  // 页面加载时获取数据
  onMounted(() => {
    loadTableData();
  });
  </script>
  
  <style scoped>
  .coupon-container {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .status-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }
  </style>