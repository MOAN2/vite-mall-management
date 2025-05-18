<template>
    <div class=" container">
      <div class="header">
        <h2>管理员</h2>
        <el-button type="primary" @click="handleAdd">新增管理员</el-button>
      </div>
  
      <!-- 表格区域 -->
      <el-table stripe :data="tableData" border style="width: 100%" v-loading="loading" fit>
        <el-table-column prop="id" label="管理员ID" min-width="100" />
        <el-table-column prop="nickname" label="管理员名称" min-width="150" />
        
        <el-table-column label="管理员头像" min-width="80">
          <template #default="{row}">
          <div  class="avatar">
            <img :src="getPath(row.avatar)" width="36" height="36" />
          </div>
          
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
        :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
        width="550px"
        center
      >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="用户名称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入用户名称" />
          </el-form-item>
          <el-form-item label="用户头像" prop="avatar">
 
          <el-upload
            :file-list="headImg"
            :action="uploadUrl"
            list-type="picture-card"
            :limit="1"
            :before-upload="beforeUpload"
            :on-success="handleUploadHead"
            :on-remove="handleRemove"
          >
            <el-icon ><Plus /></el-icon>
          </el-upload>
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
  import {beforeUpload} from "@/utils/common.js";
  import * as api from '@/api/base.js'
  // 格式化日期函数
  const formatDate = (date) => {
    return dayjs(date).format('YYYY/MM/DD HH:mm');
  };
  const BASE_URL = import.meta.env.VITE_URL;
let uploadUrl = `/api/admin/file/upload`;
  // 表格数据
  const tableData = ref([]);
  const loading = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const headImg = ref([]);
  // 弹窗相关
  const dialogVisible = ref(false);
  const dialogType = ref('add'); // 'add' 或 'edit'
  const formRef = ref(null);
  const form = reactive({
   id:null,
   nickname: '',
   avatar: '',
  });
  
  // 表单验证规则
  const rules = {
    nickname: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ]
    
  };
  watch(dialogVisible, (newValue) => {
  if (!newValue) {
    headImg.value = [];
    
  }
});
// 获取路径
const getPath = (iconValue) => {
  return BASE_URL + iconValue
};
// 处理主图文件上传
const handleUploadHead = (response, file) => {
  if (response && response.code === 200 && response.data) {
    // 替换headImg数据，确保只有服务器返回的图片
    headImg.value = [
      {
        name: file.name,
        url: `${BASE_URL}${response.data}`,
      },
    ];
  }
};

// 处理文件移除
const handleRemove = (e) => {
  headImg.value = [];
 
};
// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
 

  try {
    // todo
    // const { data } = await api.getProjectListApi({
    //   pageNo: pageNo.value,
    //   pageSize: pageSize.value,
    //   title: searchValue.value,
    // });
 const data = {
  dataList:[
  {
    id: 1,
    nickname: '管理员1',
    avatar: '/wechat/file/image/1918671035426095104.png',
  },  {
    id: 2,
    nickname: '管理员2',
    avatar: '/wechat/file/image/1918671035426095104.png',
  },  {
    id: 3,
    nickname: '管理员3',
    avatar: '/wechat/file/image/1918671035426095104.png',
  }
],
  totalCount: 3
 }
    tableData.value = data?.dataList || [];
    total.value = data.totalCount;

  } catch (error) {
    loading.value = false;
    ElMessage.error(error || "获取数据失败");
  }
  loading.value = false;
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
  
 
  
  // 新增用户
  const handleAdd = () => {
    dialogType.value = 'add';
    const now = new Date();
    Object.assign(form, {
       nickname: '',
       avatar: '',
    });
    dialogVisible.value = true;
  };
  
  // 编辑用户
  const handleEdit = (row) => {
    dialogType.value = 'edit';
      // 处理图片回显
  if (row.avatar) {
    headImg.value = [
      {
        name: "头像",
        url: `${row.avatar}`,
      },
    ];
  } else {
    headImg.value = [];
  }
    Object.assign(form, {
      nickname: row.nickname,
      avatar: row.avatar,
      id: row.id,
    });
    dialogVisible.value = true;
  };
  // 删除服务
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除服务"${row.nickname}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await api.delProjectApi({ projectIds: [row.id] });

        initTable();
        ElMessage.success("删除成功");
      } catch (error) {
        ElMessage.error(error || "删除失败，请重试");
      }
    })
    .catch(() => {
      // 取消删除
    });
};
  // 提交表单
  const submitForm = async () => {
    if (!formRef.value) return;

    await formRef.value.validate((valid) => {
    if (valid) {
   if(!headImg.value.length ) return ElMessage.warning('头像不能为空')
 
      // 处理提交前的数据格式转换
      const submitData = { ...form };

      // 处理头图
      if (headImg.value && headImg.value.length > 0) {
        submitData.avatar = headImg.value[0].url;
      } else {
        submitData.headImg = "";
      }
 

      // 调用API提交
      dialogType.value === "add"
        ? api
            .addProjectApi(submitData)
            .then(() => {
              ElMessage.success("新增成功");
              initTable();
              dialogVisible.value = false;
            })
            .catch((error) => {
              ElMessage.error(error || "新增失败，请重试");
            })
        : api
            .editProjectApi(submitData)
            .then(() => {
              ElMessage.success("更新成功");
              initTable();
              dialogVisible.value = false;
            })
            .catch((error) => {
              ElMessage.error(error || "更新失败，请重试");
            });
    }
  });
  };
  
  // 页面加载时获取数据
  onMounted(() => {
    loadTableData();
  });
  </script>
  
  <style scoped>
  . container {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .avatar {
border-radius: 50%;
    
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