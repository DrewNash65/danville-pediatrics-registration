// Simple test file to verify date utilities work correctly
const { formatDateInput, isValidDate, convertToISODate, convertFromISODate } = require('./src/lib/date-utils.ts');

console.log('Testing Date Utilities...\n');

// Test formatDateInput
console.log('Testing formatDateInput:');
console.log('Input: "12252023" -> Output:', formatDateInput('12252023'));
console.log('Input: "1225" -> Output:', formatDateInput('1225'));
console.log('Input: "12" -> Output:', formatDateInput('12'));
console.log('Input: "12-25-2023" -> Output:', formatDateInput('12-25-2023'));

// Test isValidDate
console.log('\nTesting isValidDate:');
console.log('Input: "12-25-2023" -> Valid:', isValidDate('12-25-2023'));
console.log('Input: "02-29-2024" -> Valid:', isValidDate('02-29-2024')); // Leap year
console.log('Input: "02-29-2023" -> Valid:', isValidDate('02-29-2023')); // Not leap year
console.log('Input: "13-01-2023" -> Valid:', isValidDate('13-01-2023')); // Invalid month
console.log('Input: "12-32-2023" -> Valid:', isValidDate('12-32-2023')); // Invalid day

// Test convertToISODate
console.log('\nTesting convertToISODate:');
console.log('Input: "12-25-2023" -> ISO:', convertToISODate('12-25-2023'));
console.log('Input: "01-01-2010" -> ISO:', convertToISODate('01-01-2010'));

// Test convertFromISODate
console.log('\nTesting convertFromISODate:');
console.log('Input: "2023-12-25" -> MM-DD-YYYY:', convertFromISODate('2023-12-25'));
console.log('Input: "2010-01-01" -> MM-DD-YYYY:', convertFromISODate('2010-01-01'));

console.log('\nDate utilities test completed!');
