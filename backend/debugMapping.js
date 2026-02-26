// 调试标签映射功能
const tagMapping = {
  '免费WiFi': ['免费房客WIFI', 'WIFI'],
  '免费停车': ['免费停车场'],
  '健身房': ['免费健身房'],
  '行李寄存': ['免费行李寄存'],
};

// 测试映射功能
function testMapping() {
  const testTags = ['健身房', '免费WiFi', '免费停车', '行李寄存'];
  
  console.log('=== 调试标签映射功能 ===');
  testTags.forEach(tag => {
    if (tagMapping[tag]) {
      console.log(`标签 "${tag}" 映射到: ${tagMapping[tag]}`);
    } else {
      console.log(`标签 "${tag}" 没有映射`);
    }
  });
  
  // 测试多个标签的情况
  console.log('\n=== 测试多个标签的映射 ===');
  const multipleTags = ['免费WiFi', '健身房'];
  let mappedFacilities = [];
  multipleTags.forEach(facility => {
    if (tagMapping[facility]) {
      mappedFacilities = [...mappedFacilities, ...tagMapping[facility]];
    } else {
      mappedFacilities.push(facility);
    }
  });
  console.log(`原始标签: ${multipleTags}`);
  console.log(`映射后的标签: ${mappedFacilities}`);
}

testMapping();
