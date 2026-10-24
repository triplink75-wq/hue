/**
 * =========================================================================
 * TRIPLINK HUEGO - GOOGLE APPS SCRIPT WEBHOOK VÀ ĐỒNG BỘ CƠ SỞ DỮ LIỆU
 * =========================================================================
 * Google Apps Script Library:
 * https://script.google.com/macros/library/d/1JygSfRFjV-NkdWe-MAPMKiPsyWjFEEgxuH183FrjJ3C_ZE_E-KAK6DG3/3
 * Script Project ID: 1JygSfRFjV-NkdWe-MAPMKiPsyWjFEEgxuH183FrjJ3C_ZE_E-KAK6DG3
 * Version: 3
 * =========================================================================
 * Hướng dẫn cài đặt vào Google Sheet:
 * 1. Mở file Google Sheet của bạn trên Google Drive.
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> chọn "Apps Script".
 * 3. Xóa hết code cũ trong file Code.gs và dán toàn bộ nội dung file này vào.
 * 4. Nhấn nút "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 * 5. Chọn loại "Ứng dụng web" (Web App):
 *    - Mô tả: TRIPLINK Webhook v2
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Người có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 6. Nhấn "Triển khai" và sao chép đường link Webhook (URL kết thúc bằng /exec).
 * =========================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  
  if (action === 'check_payment') {
    var orderId = e.parameter.orderId || '';
    var sheet = getOrCreateSheet('ThanhToan_DonHang');
    var data = sheet.getDataRange().getValues();
    var paid = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] == orderId && String(data[i][10]).indexOf('ĐÃ THANH TOÁN') !== -1) {
        paid = true;
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ paid: paid, orderId: orderId }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'TRIPLINK Google Sheets Webhook is active!' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var now = new Date();
    var timeStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

    var action = data.action || (data.orderType ? 'booking' : 'general');

    // 1. LƯU CHUYẾN HÀNH TRÌNH ĐƯỢC CHỌN VÀ GỬI EMAIL LỊCH TRÌNH
    if (action === 'save_itinerary' || data.orderType === 'Gói Tạo Lịch Trình AI (50.000đ - 5 Lượt VIP)') {
      var tripSheet = getOrCreateSheet('LichTrinh_ChuyenDi', [
        'Thời gian', 'Mã Hành Trình', 'Họ & Tên', 'Số Điện Thoại', 'Email', 
        'Thời Lượng', 'Ngân Sách/Người', 'Điểm Đã Chọn', 'Nhịp Độ', 'Trạng Thái'
      ]);

      var stopsStr = Array.isArray(data.selectedStops) ? data.selectedStops.join(', ') : (data.stops || '');

      tripSheet.appendRow([
        timeStr,
        data.bookingCode || ('TL-' + Math.floor(100000 + Math.random() * 900000)),
        data.custName || 'Khách Du Lịch',
        data.custPhone || '',
        data.custEmail || '',
        data.totalDays || data.days || '2 Ngày 1 Đêm',
        data.budgetPerPerson ? (data.budgetPerPerson.toLocaleString('vi-VN') + 'đ') : (data.budgetChosen || ''),
        stopsStr,
        data.pacing || 'Đầy đủ & Tối ưu',
        data.status || 'ĐÃ CHỌN HÀNH TRÌNH (GÓI 50K)'
      ]);

      // TỰ ĐỘNG GỬI EMAIL LỊCH TRÌNH CHO KHÁCH HÀNG NẾU CÓ EMAIL
      if (data.custEmail && data.custEmail.indexOf('@') !== -1) {
        try {
          var subject = "🌸 [TRIPLINK HUẾ] Xác nhận chuyến hành trình Cố Đô của bạn (" + (data.bookingCode || 'VIP') + ")";
          var emailHtml = `
            <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width:620px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 25px rgba(0,0,0,0.06);">
              <div style="background:linear-gradient(135deg, #701a75 0%, #1e3a8a 100%); padding:28px; text-align:center; color:#ffffff;">
                <h1 style="margin:0; font-size:22px; letter-spacing:0.03em;">🌸 TRIPLINK HUEGO</h1>
                <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">Cẩm Nang & Lịch Trình Khám Phá Cố Đô Trọn Vẹn</p>
              </div>
              <div style="padding:28px; color:#1e293b; line-height:1.65;">
                <p style="font-size:16px; margin-top:0;">Kính chào <strong>${data.custName || 'Quý khách'}</strong>,</p>
                <p>Cảm ơn bạn đã lựa chọn <strong>TRIPLINK</strong> cho chuyến khám phá xứ Huế mộng mơ. Dưới đây là thông tin chi tiết về hành trình của bạn:</p>
                
                <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:18px; margin:20px 0;">
                  <table style="width:100%; border-collapse:collapse; font-size:14px;">
                    <tr><td style="padding:6px 0; color:#64748b; width:40%;">Mã Hành Trình:</td><td style="font-weight:700; color:#701a75;">${data.bookingCode || 'TL-8888'}</td></tr>
                    <tr><td style="padding:6px 0; color:#64748b;">Thời lượng:</td><td style="font-weight:600;">${data.totalDays || data.days || '2 Ngày 1 Đêm'}</td></tr>
                    <tr><td style="padding:6px 0; color:#64748b;">Gói dịch vụ:</td><td style="font-weight:600; color:#059669;">Đã thanh toán gói AI VIP (50.000đ)</td></tr>
                    <tr><td style="padding:6px 0; color:#64748b;">Điểm & món ưu tiên:</td><td style="font-weight:600;">${stopsStr || 'Đại Nội Huế, Chùa Thiên Mụ, Lăng Khải Định, Bún bò Huế'}</td></tr>
                  </table>
                </div>

                <div style="background:#fdf4ff; border:1px solid #f0abfc; border-radius:12px; padding:16px; margin:20px 0;">
                  <strong style="color:#701a75; font-size:15px;">🎁 Quà tặng kèm gói:</strong>
                  <ul style="margin:8px 0 0; padding-left:20px; font-size:13.5px; color:#4a044e;">
                    <li>Mở khóa toàn bộ Audio Guide thuyết minh di sản không giới hạn.</li>
                    <li>Bộ 6 E-Voucher giảm giá 10% - 20% tại các nhà hàng, quán cafe đối tác.</li>
                    <li>Hỗ trợ khẩn cấp từ Local Guide thổ địa Huế qua hotline: 0905.123.456.</li>
                  </ul>
                </div>

                <p style="font-size:13.5px; color:#64748b; margin-bottom:0;">Chúc bạn có một chuyến trải nghiệm Cố Đô thật trọn vẹn, ý nghĩa và ngập tràn kỷ niệm đẹp!</p>
              </div>
              <div style="background:#f1f5f9; padding:16px; text-align:center; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0;">
                TRIPLINK HUEGO • Cố Đô Huế, Việt Nam • Hotline: 0905.123.456 • Email: triplink75@gmail.com
              </div>
            </div>
          `;
          MailApp.sendEmail({
            to: data.custEmail,
            subject: subject,
            htmlBody: emailHtml
          });
        } catch(mailErr) {
          Logger.log("Email error: " + mailErr.toString());
        }
      }
    }

    // 2. LƯU TÀI KHOẢN ĐĂNG KÝ MỚI
    else if (action === 'register' || data.orderType === 'ĐĂNG KÝ TÀI KHOẢN MỚI (Form Đăng Ký)') {
      var userSheet = getOrCreateSheet('KhachHang_DangKy', [
        'Thời gian', 'Họ & Tên', 'Số Điện Thoại', 'Email', 'Ghi Chú'
      ]);
      userSheet.appendRow([
        timeStr,
        data.custName || data.name || '',
        data.custPhone || data.phone || '',
        data.custEmail || data.email || '',
        data.notes || 'Đăng ký tài khoản người dùng TRIPLINK'
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Data synced successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#701a75");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
    }
  }
  return sheet;
}
