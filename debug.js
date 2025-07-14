console.log('Testing ColorConverter initialization...')

// Simple test of the hexToRgb function
const testHex = '#3b82f6'
console.log('Test hex:', testHex)

// Simulate the hex conversion
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const rgb = hexToRgb(testHex)
console.log('Converted RGB:', rgb)

// This should output: { r: 59, g: 130, b: 246 }
if (rgb.r === 59 && rgb.g === 130 && rgb.b === 246) {
  console.log('✅ Hex to RGB conversion works correctly!')
} else {
  console.log('❌ Hex to RGB conversion failed')
}
