<template>
  <div class="service-container">
    <div class="header">
      <h2>分类图标管理</h2>
     
    </div>

    <!-- 表格区域 -->
    <el-table
    stripe
      :data="iconOptions"
      border
      style="width: 100%"
      v-loading="loading"
      fit
      @selection-change="handleSelectionChange"
    >
      
      <el-table-column prop="label" label="图标名称" min-width="80" />
      <el-table-column prop="isPreset" label="是否预设" min-width="80" >
        <template #default="scope">{{ scope.row.isPreset?'是':'否' }}</template>
</el-table-column>
      <el-table-column prop="value" label="图标" min-width="150" >

        <template #default="scope">
          
            <img :src="getIconPath(scope.row.value)" width="24" height="24" />
           
        </template>
      </el-table-column>
      
    </el-table>

    <!-- 分页 -->
    <!-- <div class="pagination">
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div> -->

 
  </div>
</template>

<script setup>
import * as api from "@/api/base.js";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {   iconOptions } from "@/enum/index";
 

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(10);
 
// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  tableData.value=
  loading.value = false;
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 页码变化
const handleCurrentChange = (val) => {
  pageNo.value = val;
  loadTableData();
};

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

 // 获取图标路径
const getIconPath = (iconValue) => {
  try {
    // 获取图标名称（不带路径）
    const iconObj = iconOptions.find((item) => item.value === iconValue);
    if (!iconObj) return "";

    // 从path中提取文件名
    let fileName = "";
    if (iconObj.path) {
      // 处理路径格式，提取文件名
      const pathParts = iconObj.path.split("/");
      fileName = pathParts[pathParts.length - 1];
    }

    // 如果没有文件名，使用默认图标
    if (!fileName) {
      fileName = "jiazhengfuwu.png";
    }

    // 直接从assets目录加载
    return `/src/assets/icon/${fileName}`;
  } catch (error) {
    console.error("获取图标路径出错:", error);
    return "";
  }
}; 
// 页面加载时获取数据
onMounted(() => {
 
});
</script>

<style scoped>
.service-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
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

.batch-delete-confirm {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 15px;
}

.warning-text {
  color: #f56c6c;
  margin-top: 10px;
  font-size: 12px;
}
</style>
