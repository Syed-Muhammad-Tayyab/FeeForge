/* ==========================================================================
   FeeForge — School Fee Invoice Generator
   Developed by Syed Muhammad Tayyab
   https://github.com/Syed-Muhammad-Tayyab/FeeForge
   ========================================================================== */

  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  
  // Format date as DD-MM-YYYY
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  // Format date as Month Day, Year
  function formatLongDate(dateString) {
    if (!dateString) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }
  
  // Convert number to words
  function numberToWords(num) {
    const ones = ['', 'One','Two','Three','Four','Five','Six','Seven','Eight','Nine'];
    const tens = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const teens = ['Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];

    function convertLessThanOneThousand(n) {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
      return '';
    }

    if (num === 0) return 'Zero';
    let result = '';
    if (num >= 100000) {
      result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }
    if (num >= 1000) {
      result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    if (num > 0) {
      result += convertLessThanOneThousand(num);
    }
    return result.trim() + ' Rupees Only';
  }
  
  // Calculate total fee
  function calculateTotal() {
    const admissionFee = parseFloat(document.getElementById('admissionFee').value) || 0;
    const tuitionFee = parseFloat(document.getElementById('tuitionFee').value) || 0;
    const securityFee = parseFloat(document.getElementById('securityFee').value) || 0;
    const annualCharges = parseFloat(document.getElementById('annualCharges').value) || 0;
    const registrationFee = parseFloat(document.getElementById('registrationFee').value) || 0;
    const bookPack = parseFloat(document.getElementById('bookPack').value) || 0;
    const otherCharges = parseFloat(document.getElementById('otherCharges').value) || 0;
    
    const total = admissionFee + tuitionFee + securityFee + annualCharges + 
                  registrationFee + bookPack + otherCharges;
    
    return total;
  }
  
  // Generate invoice HTML for all students
  function generateInvoice() {
    const studentNamesText = document.getElementById('studentNames').value;
    const fatherNamesText = document.getElementById('fatherNames').value;
    
    if (!studentNamesText.trim() || !fatherNamesText.trim()) {
      alert('Please enter both student names and father names');
      return;
    }
    
    const studentNames = studentNamesText.split('\n').filter(name => name.trim());
    const fatherNames = fatherNamesText.split('\n').filter(name => name.trim());
    
    if (studentNames.length !== fatherNames.length) {
      alert('Number of student names must match number of father names');
      return;
    }
    
    const total = calculateTotal();
    const amountInWords = numberToWords(total);
    const formattedTotal = total.toLocaleString('en-IN');
    
    const schoolName = document.getElementById('schoolName').value;
    const invoiceDate = formatDate(document.getElementById('invoiceDate').value);
    let voucherNo = parseInt(document.getElementById('startingVoucherNo').value) || 1;
    const collectionAt = document.getElementById('collectionAt').value;
    const month = document.getElementById('month').value;
    const validUntil = formatLongDate(document.getElementById('validUntil').value);
    const studentClass = document.getElementById('studentClass').value;
    const rollNoPrefix = document.getElementById('rollNo').value;
    
    const admissionFee = parseFloat(document.getElementById('admissionFee').value) || 0;
    const tuitionFee = parseFloat(document.getElementById('tuitionFee').value) || 0;
    const securityFee = parseFloat(document.getElementById('securityFee').value) || 0;
    const annualCharges = parseFloat(document.getElementById('annualCharges').value) || 0;
    const registrationFee = parseFloat(document.getElementById('registrationFee').value) || 0;
    const bookPack = parseFloat(document.getElementById('bookPack').value) || 0;
    const otherCharges = parseFloat(document.getElementById('otherCharges').value) || 0;
    
    // Get logo if uploaded
    const logoUpload = document.getElementById('logoUpload');
    let logoHTML = '<div style="width:60px;"></div>';
    let logoBase64 = '';
    
    if (logoUpload.files && logoUpload.files[0]) {
      logoHTML = '<img src="" width="60" alt="School Logo" class="school-logo">';
      
      // Read logo as base64
      const reader = new FileReader();
      reader.onload = function(e) {
        logoBase64 = e.target.result;
        document.querySelectorAll('.school-logo').forEach(img => {
          img.src = logoBase64;
        });
      };
      reader.readAsDataURL(logoUpload.files[0]);
    }
    
    let allInvoicesHTML = '';
    
    // Group invoices in pairs
    for (let i = 0; i < studentNames.length; i++) {
      const studentName = studentNames[i].trim();
      const fatherName = fatherNames[i].trim();
      const rollNo = rollNoPrefix ? `${rollNoPrefix}${i + 1}` : (i + 1).toString();
      
      // Start a new pair container for every two invoices
      if (i % 2 === 0) {
        allInvoicesHTML += '<div class="invoice-pair">';
      }
      
      // Generate invoice
      const invoiceHTML = `
        <div class="invoice">
          <div class="header">
            ${logoHTML}
            <div class="school-name">${schoolName}</div>
            <div style="width:60px;"></div>
          </div>

          <div class="info">
            <div>Date: ${invoiceDate}</div>
            <div>Voucher No: ${voucherNo}</div>
          </div>
          <div class="info">
            <div>Collection at: ${collectionAt}</div>
            <div>Month: ${month}</div>
          </div>
          <div class="info">
            <div>Not Valid After ${validUntil}</div>
          </div>

          <div class="student-info">
            <div style="width:50%;">Name: ${studentName}</div>
            <div style="width:50%;">Father's Name: ${fatherName}</div>
          </div>
          <div class="student-info">
            <div style="width:50%;">Class: ${studentClass}</div>
            <div style="width:50%;">Roll No: ${rollNo}</div>
          </div>

          <table>
            <tr><th>Sr#</th><th>Title</th><th>Rs.</th></tr>
            <tr><td>1</td><td>Admission Fee</td><td>${admissionFee.toLocaleString('en-IN')}</td></tr>
            <tr><td>2</td><td>Tuition Fee</td><td>${tuitionFee.toLocaleString('en-IN')}</td></tr>
            <tr><td>3</td><td>Security Fee</td><td>${securityFee.toLocaleString('en-IN')}</td></tr>
            <tr><td>4</td><td>Annual charges</td><td>${annualCharges.toLocaleString('en-IN')}</td></tr>
            <tr><td>5</td><td>Registration Fee</td><td>${registrationFee.toLocaleString('en-IN')}</td></tr>
            <tr><td>6</td><td>Book Pack Amount</td><td>${bookPack.toLocaleString('en-IN')}</td></tr>
            <tr><td>7</td><td>Other</td><td>${otherCharges.toLocaleString('en-IN')}</td></tr>
            <tr><td colspan="2">Total</td><td>${formattedTotal}</td></tr>
            <tr><td colspan="2">Payable Amount</td><td>${formattedTotal}.00</td></tr>
          </table>

          <div class="footer">
            <p>Total amount in words: <strong>${amountInWords}</strong></p>
          </div>

          <div class="signatures">
            <div class="sign-box">Administration Office:</div>
            <div class="sign-box">Date:</div>
          </div>
        </div>
      `;
      
      allInvoicesHTML += invoiceHTML;
      voucherNo++;
      
      // Close the pair container after two invoices or at the end
      if (i % 2 === 1 || i === studentNames.length - 1) {
        allInvoicesHTML += '</div>';
      }
    }
    
    document.getElementById('invoicePreview').innerHTML = allInvoicesHTML;
    
    // Update logo sources if available
    if (logoBase64) {
      document.querySelectorAll('.school-logo').forEach(img => {
        img.src = logoBase64;
      });
    }
  }
  
  // Download PDF function - improved version with logo fix
  async function downloadPDF() {
    generateInvoice();
    
    // Show loading state
    const pdfBtn = document.querySelector('.btn-success');
    const originalText = pdfBtn.innerHTML;
    pdfBtn.innerHTML = 'Generating PDF...';
    pdfBtn.disabled = true;
    
    try {
      // Get logo if uploaded
      const logoUpload = document.getElementById('logoUpload');
      let logoBase64 = '';
      
      // Wait for logo to load if it exists
      if (logoUpload.files && logoUpload.files[0]) {
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function(e) {
            logoBase64 = e.target.result;
            document.querySelectorAll('.school-logo').forEach(img => {
              img.src = logoBase64;
            });
            // Small delay to ensure images are rendered
            setTimeout(resolve, 200);
          };
          reader.readAsDataURL(logoUpload.files[0]);
        });
      }
      
      // Get all invoice elements
      const invoices = document.querySelectorAll('.invoice');
      
      if (invoices.length === 0) {
        alert('FeeForge: no vouchers to download. Please generate them first.');
        return;
      }
      
      // Create PDF in landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Process invoices two at a time (side by side)
      for (let i = 0; i < invoices.length; i += 2) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Process two invoices per page
        for (let j = 0; j < 2 && (i + j) < invoices.length; j++) {
          const invoice = invoices[i + j];
          
          // Create canvas from single invoice
          const canvas = await html2canvas(invoice, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: null,
            async: true
          });
          
          // Calculate position
          const imgWidth = 140; // Fixed width for each invoice
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const xPos = j === 0 ? 5 : 148; // Position two invoices side by side
          const yPos = 10;
          
          // Add image to PDF
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, yPos, imgWidth, imgHeight);
        }
      }
      
      // Save PDF
      pdf.save('FeeForge-Fee-Vouchers.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Restore button
      pdfBtn.innerHTML = originalText;
      pdfBtn.disabled = false;
    }
  }
  
  // Set default dates on page load
  document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = formattedDate;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const formattedDueDate = dueDate.toISOString().split('T')[0];
    document.getElementById('validUntil').value = formattedDueDate;
    
    // Set example student names and father names
    document.getElementById('studentNames').value = "Minash Fatima\nStudent2\nStudent3";
    document.getElementById('fatherNames').value = "Farhan\nFather2\nFather3";
  });