# Hồ sơ submit App Store: Neon Blocks 1.0.0

Tài liệu này gom mọi thứ cần điền trong App Store Connect cho bản 1.0.0, theo đúng thứ tự các
màn hình trong App Store Connect. Các khối nội dung có thể copy dán thẳng. Độ dài từng trường đã
được kiểm tra bằng script theo giới hạn của Apple.

- App: **Neon Blocks: Cyber Stack** · Apple ID `6818053046` · Bundle ID `com.neonblocks.cyber`
- Team: Phan Khac Cuong (Individual) · `YC5GD8U2GQ`
- Ngôn ngữ trên store: **English (U.S.)** là ngôn ngữ chính, thêm **Vietnamese**

---

## 0. Việc phải xong trước khi bấm Submit

| #   | Việc                                                                                                                                                                                                                          | Vì sao                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | ~~Bỏ chữ "Tetris" khỏi giao diện game~~ **Đã xong**: thay bằng "Quad" / "Bốn hàng"; tên các mức Zone lấy từ Tetris Effect (Octoris, Decahexatris…) cũng đã đổi. Test `i18n.test.ts` chặn các từ này quay lại.                 | "Tetris" là thương hiệu của The Tetris Company.                                                                             |
| 2   | **Build mới và upload** (`pnpm release:ios`)                                                                                                                                                                                  | Bản trên TestFlight hiện tại (1.0.0 build 1) build từ trước khi có chế độ chơi, giao diện mới, tiếng Việt và hướng dẫn.     |
| 3   | ~~Đưa Privacy Policy và Support lên URL công khai~~ **Đã xong**: <https://neonblocks-app.vercel.app/privacy> và <https://neonblocks-app.vercel.app/support> (Vercel, team DeepOcean, project `neon-blocks`, nguồn ở `site/`). | Bắt buộc với mọi app.                                                                                                       |
| 4   | ~~Điền email liên hệ~~ **Đã xong**: tonyphvincent@gmail.com (trong `PRIVACY.md` và cả hai trang web).                                                                                                                         | Apple và người dùng cần một kênh liên hệ thật.                                                                              |
| 5   | **Chơi thử trọn vẹn trên iPhone thật**: cài mới → cài đặt → hướng dẫn 7 bước → một ván                                                                                                                                        | Reviewer làm đúng luồng này. Đặc biệt kiểm tra cử chỉ vuốt mạnh để thả nhanh (ngưỡng tốc độ chưa được chỉnh trên máy thật). |
| 6   | Chụp screenshot (mục 4)                                                                                                                                                                                                       | Bắt buộc ít nhất 1 ảnh cỡ 6.9".                                                                                             |

---

## 1. App Information

| Trường             | Giá trị                                                                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name (EN)          | `Neon Blocks: Cyber Stack` (24/30)                                                                                                                                                        |
| Name (VI)          | `Neon Blocks: Cyber Stack` (giữ nguyên thương hiệu)                                                                                                                                       |
| Subtitle (EN)      | `Block puzzle with 7 modes` (25/30)                                                                                                                                                       |
| Subtitle (VI)      | `Xếp khối với 7 chế độ chơi` (26/30)                                                                                                                                                      |
| Primary category   | **Games** → subcategory **Puzzle**                                                                                                                                                        |
| Secondary category | **Games** → subcategory **Arcade**                                                                                                                                                        |
| Content Rights     | "This app does not contain, show, or access third-party content." Font (SIL OFL) và icon (Apache 2.0) đều có giấy phép dùng thương mại, không tính là nội dung bên thứ ba theo nghĩa này. |
| Age Rating         | Xem mục 6 → **4+**                                                                                                                                                                        |
| Copyright          | `2026 Phan Khac Cuong`                                                                                                                                                                    |

## 2. Pricing and Availability

- Price: **Free** (USD 0.00)
- Availability: **All countries or regions**
- Không có In-App Purchase, không có subscription.

## 3. Nội dung trang sản phẩm (Version 1.0.0)

### 3.1 Promotional Text

Sửa được bất cứ lúc nào mà không cần review lại.

**EN** (137/170)

```
New: a one-minute tutorial, eight hand-made themes and full Vietnamese. Stack, clear and chain your way through seven modes, all offline.
```

**VI** (124/170)

```
Mới: hướng dẫn một phút, tám giao diện mới và đầy đủ tiếng Việt. Xếp, xóa, tạo chuỗi qua bảy chế độ chơi, hoàn toàn offline.
```

### 3.2 Description

**EN**

```
Neon Blocks is a falling-block puzzle made for touch. Drag to slide, tap to turn, flick to drop. No buttons in the way, just you and the board.

SEVEN WAYS TO PLAY
• Marathon: endless, faster every 10 lines
• Sprint: clear 40 lines against the clock
• Ultra: two minutes to score as much as you can
• Dig: tunnel through ten rows of garbage
• Cascade: loose blocks fall after a clear and set off chain reactions
• Mutators: every level bends a rule, from fog and mirrored controls to ghost blocks and turbo
• Daily: three minutes with the same pieces and the same twist for every player that day

ZONE
Clears charge your Zone meter. Trigger it to stop time, pile the lines you clear at the bottom of the well, and let them all burst at once.

EIGHT THEMES
Four cyberpunk looks (Night City, Neon Rain, Outrun, Amber Terminal) and four hand-made ones (Blueprint, Sugar Rush, Kintsugi, Cathedral). Each theme changes the blocks, the panels, the lettering and the backdrop, not just the colours.

PROGRESS
Records for every mode, a Daily streak, 22 awards to earn, and a result card you can share.

NEW TO THE GAME?
A one-minute interactive tutorial walks you through every move on a real board before your first game.

RESPECTS YOU
Plays fully offline. No account, no ads, no tracking, no in-app purchases. Nothing leaves your device.

Available in English and Vietnamese.
```

**VI**

```
Neon Blocks là game xếp khối rơi được làm riêng cho màn hình cảm ứng. Kéo để di chuyển, chạm để xoay, vuốt để thả. Không có nút bấm che màn hình, chỉ có bạn và bảng chơi.

BẢY CÁCH CHƠI
• Marathon: chơi không giới hạn, cứ 10 hàng lại nhanh hơn
• Nước rút: xóa 40 hàng nhanh nhất có thể
• Hai phút: ghi càng nhiều điểm càng tốt trong hai phút
• Đào hầm: đào xuyên qua mười hàng rác
• Dây chuyền: xóa hàng xong, khối lơ lửng rơi xuống và nổ tiếp thành chuỗi
• Đột biến: mỗi cấp đổi một luật chơi, từ sương mù, đảo chiều đến bóng ma và tăng tốc
• Thử thách ngày: ba phút với cùng bộ khối và cùng luật chơi cho mọi người trong ngày

ZONE
Xóa hàng để nạp thanh Zone. Kích hoạt để đóng băng thời gian, dồn các hàng đã xóa xuống đáy rồi cho nổ cùng một lúc.

TÁM GIAO DIỆN
Bốn giao diện cyberpunk (Thành phố đêm, Mưa neon, Outrun, Màn hình hổ phách) và bốn giao diện thủ công (Bản vẽ, Kẹo dẻo, Kintsugi, Thánh đường). Mỗi giao diện đổi cả hình khối, khung, kiểu chữ lẫn hình nền, không chỉ đổi màu.

TIẾN TRÌNH
Kỷ lục cho từng chế độ, chuỗi ngày chơi Thử thách ngày, 22 thành tích để mở khóa và thẻ kết quả để khoe với bạn bè.

MỚI CHƠI?
Một phút hướng dẫn tương tác giúp bạn làm quen từng thao tác ngay trên bảng chơi trước ván đầu tiên.

TÔN TRỌNG BẠN
Chơi hoàn toàn offline. Không cần tài khoản, không quảng cáo, không theo dõi, không mua trong app. Dữ liệu chỉ nằm trên máy của bạn.

Có tiếng Việt và tiếng Anh.
```

### 3.3 Keywords

Không lặp lại chữ đã có trong Name/Subtitle (Apple đã tự đánh chỉ mục những chữ đó), không dùng
tên thương hiệu của game khác.

**EN** (100/100 ký tự)

```
puzzle,falling,brick,line,clear,offline,arcade,retro,daily,challenge,classic,sprint,zen,brain,casual
```

**VI** (73 ký tự, 96/100 byte. Chữ có dấu tốn 2–3 byte nên giữ dưới 100 byte cho chắc)

```
xếp gạch,xếp hình,giải đố,trí tuệ,offline,thử thách,cổ điển,arcade,puzzle
```

### 3.4 URLs

| Trường             | Bắt buộc               | Giá trị                                        |
| ------------------ | ---------------------- | ---------------------------------------------- |
| Support URL        | Có                     | `https://neonblocks-app.vercel.app/support`    |
| Marketing URL      | Không                  | `https://neonblocks-app.vercel.app` (tùy chọn) |
| Privacy Policy URL | Có (ở mục App Privacy) | `https://neonblocks-app.vercel.app/privacy`    |

### 3.5 What's New

Bản 1.0.0 là bản đầu nên App Store Connect không hiện trường này. Dùng mẫu sau cho bản 1.0.1 trở đi:

```
EN: Bug fixes and polish.
VI: Sửa lỗi và tinh chỉnh.
```

---

## 4. Screenshots

- **Bắt buộc:** bộ ảnh **iPhone 6.9"**, cỡ **1320 × 2868** px dọc (đúng cỡ màn hình iPhone 16 Pro Max
  trên simulator), 3–10 ảnh. App không hỗ trợ iPad (`supportsTablet: false`) nên không cần ảnh iPad.
- Mỗi ngôn ngữ có thể có bộ ảnh riêng: bộ VI chụp với game đang ở tiếng Việt.
- **Không được** có chữ "Tetris" trong ảnh (xem mục 0). Không chụp nút bánh răng xanh của Expo Go:
  chụp từ bản build native (`pnpm ios:release`).

| #   | Màn hình                                      | Giao diện     | Caption EN                     | Caption VI                          |
| --- | --------------------------------------------- | ------------- | ------------------------------ | ----------------------------------- |
| 1   | Đang chơi, bảng đầy khối màu, có bóng khối    | Thành phố đêm | Drag. Tap. Flick.              | Kéo. Chạm. Vuốt.                    |
| 2   | Màn chọn chế độ (Chọn chế độ)                 | Outrun        | Seven ways to play             | Bảy cách chơi                       |
| 3   | Đang Zone: viền xanh, các hàng Zone dồn ở đáy | Mưa neon      | Stop time with Zone            | Đóng băng thời gian với Zone        |
| 4   | Danh sách giao diện                           | Kintsugi      | Eight themes, not just colours | Tám giao diện, không chỉ đổi màu    |
| 5   | Thẻ kết quả "Kỷ lục mới" + thành tích vừa mở  | Kẹo dẻo       | Records, streaks and 22 awards | Kỷ lục, chuỗi ngày và 22 thành tích |
| 6   | Thử thách ngày                                | Thánh đường   | A new challenge every day      | Thử thách mới mỗi ngày              |

## 5. App Privacy (nhãn dinh dưỡng quyền riêng tư)

Câu hỏi đầu tiên: **"Do you or your third-party partners collect data from this app?" → No, we do
not collect data from this app.** Kết quả trên store: **Data Not Collected**.

Cơ sở, đã kiểm tra trong code và trong bản build:

- Không có lệnh gọi mạng nào trong mã nguồn; game chạy hoàn toàn offline.
- Không SDK quảng cáo, phân tích hay theo dõi. `NSPrivacyTracking = false`, không có tracking domain.
- Không xin quyền nào: micro (đã tắt trong cấu hình expo-audio), camera, ảnh, vị trí, theo dõi
  (ATT) đều không có. Không có background mode.
- Điểm, cài đặt, thành tích lưu bằng AsyncStorage ngay trên máy, không gửi đi đâu.
- Chia sẻ kết quả dùng bảng chia sẻ của iOS với một ảnh tạo trên máy; app không nhận lại dữ liệu gì.
- `PrivacyInfo.xcprivacy` khai báo các "required reason API" mà React Native và Expo dùng:
  UserDefaults (CA92.1), File timestamp (C617.1), System boot time (35F9.1).

## 6. Age Rating

Trả lời **None / No** cho tất cả:

| Nhóm câu hỏi                                               | Trả lời                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Bạo lực (hoạt hình, thực tế, kéo dài)                      | None                                                                           |
| Nội dung người lớn, khỏa thân, gợi dục                     | None                                                                           |
| Ngôn từ thô tục, hài thô                                   | None                                                                           |
| Kinh dị, sợ hãi                                            | None                                                                           |
| Rượu bia, thuốc lá, chất kích thích                        | None                                                                           |
| Chủ đề y tế, điều trị                                      | None                                                                           |
| Cờ bạc mô phỏng / cờ bạc thật, cuộc thi có giải thưởng     | None / No (Thử thách ngày không có giải thưởng, không có bảng xếp hạng online) |
| Nội dung do người dùng tạo, chat, giao tiếp với người khác | No                                                                             |
| Truy cập web không giới hạn                                | No                                                                             |
| Mua trong app, quảng cáo                                   | No                                                                             |

→ **4+**

## 7. Encryption (Export Compliance)

`ITSAppUsesNonExemptEncryption = NO` đã có trong Info.plist (`usesNonExemptEncryption: false` trong
`app.json`), nên App Store Connect sẽ không hỏi lại. Nếu được hỏi: **"None of the algorithms
mentioned above"**: app không dùng mã hóa nào.

## 8. App Review Information

| Trường                                | Giá trị                  |
| ------------------------------------- | ------------------------ |
| Sign-in required                      | **No**                   |
| Contact first/last name, phone, email | _điền thông tin của bạn_ |
| Attachment                            | Không cần                |

**Notes** (dán nguyên văn, reviewer đọc tiếng Anh):

```
Neon Blocks is a single-player falling-block puzzle that works entirely offline. There is no account or sign-in, no network access, no ads and no in-app purchases. The app requests no permissions.

First launch:
1. A three-page setup: language, theme, then sound/haptics. Tap Continue on each page.
2. A short mandatory interactive tutorial (about one minute). Each step moves on as soon as the gesture is performed:
   - Move: drag left, then right
   - Rotate: tap the screen twice
   - Soft drop: drag down slowly
   - Hard drop: a quick flick downwards
   - Hold: swipe up
   - Clear lines: tap once to stand the long piece upright, drag it right into the gap, then flick down
   - Zone: tap the Zone button at the top right
3. The main menu follows. Play > any mode starts a game.

Controls are gestures on the board; the pause button is at the top left. Sharing a result uses the standard iOS share sheet with an image generated on the device.

The app is available in English and Vietnamese; it follows the device language on first launch and can be switched in Settings.
```

## 9. Build và nộp

1. `pnpm release:ios`: kiểm tra code, build trên EAS (số build tự tăng), upload lên App Store Connect.
2. Đợi build hết trạng thái Processing (khoảng 5–15 phút), thử qua TestFlight trên máy thật.
3. Trong trang version 1.0.0 → mục **Build** → chọn build mới.
4. **Version Release**: nên chọn _Manually release this version_ để tự bấm phát hành sau khi được duyệt.
5. **Add for Review** → **Submit to App Review**. Thời gian duyệt thường 1–3 ngày.

### Nếu bị từ chối

| Lý do thường gặp                           | Cách xử lý                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4.1 / 5.2.1: trademark (Tetris)            | Làm việc số 1 ở mục 0 trước khi nộp.                                                                                                                                           |
| 4.3: Spam, "đã có quá nhiều app giống vậy" | Trả lời trong Resolution Center, nêu điểm khác biệt: điều khiển hoàn toàn bằng cử chỉ, chế độ Dây chuyền và Đột biến, Zone, tám giao diện tự thiết kế, Thử thách ngày offline. |
| 2.1: Reviewer kẹt ở hướng dẫn              | Notes ở mục 8 đã mô tả từng bước. Nếu vẫn kẹt, cân nhắc làm thử nghiệm nhẹ hơn cho bước "vuốt mạnh".                                                                           |
| 5.1.1: Privacy Policy URL lỗi              | Kiểm tra URL mở được mà không cần đăng nhập.                                                                                                                                   |
