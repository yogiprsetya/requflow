# TODO — SpecLess / Requflow

Daftar ini berisi fitur yang belum selesai atau belum sepenuhnya sesuai dengan `SPEC.md`.
Prioritas:

- **P0** — fitur inti yang belum tersedia atau menyebabkan data/fitur hilang.
- **P1** — fitur MVP yang belum lengkap atau perilakunya belum sesuai spesifikasi.
- **P2** — penyempurnaan struktur UI dan fitur fase berikutnya.

## P0 — Fitur inti yang belum dibuat

- [ ] **Request history dan replay**
  - Simpan request/response yang telah dieksekusi.
  - Tambahkan tampilan History.
  - Buka history dalam mode read-only.
  - Tambahkan aksi **Re-run** untuk memuat request kembali ke builder.
  - Acceptance: request lama dapat dibuka dan dijalankan ulang tanpa kehilangan endpoint aktif.
  - Referensi: `SPEC.md` §5, `app/(platform)/playground/playground-store.ts`.

- [ ] **Notification panel dan unread state**
  - Tambahkan tombol notification di Navbar.
  - Tampilkan unread badge/dot.
  - Tambahkan panel/dropdown dengan empty state untuk MVP.
  - Hubungkan hasil import dan error async ke notification/toast.
  - Acceptance: user mendapat konfirmasi setelah import berhasil dan dapat melihatnya dari panel.
  - Referensi: `SPEC.md` §2, `app/(platform)/navbar.tsx`.

- [ ] **Response headers viewer**
  - Render `response.headers` sebagai daftar atau tabel.
  - Pertahankan tampilan status, timing, size, dan body yang sudah ada.
  - Acceptance: header response dapat dibaca setelah request berhasil.
  - Referensi: `SPEC.md` §5, `app/(platform)/playground/response-viewer.tsx`.

## P1 — Fitur MVP yang belum lengkap

- [ ] **Add Endpoint action di Sidebar**
  - Tambahkan tombol `+ Add Endpoint` pada Sidebar.
  - Sediakan pilihan `Import Spec` atau `Add Manually`.
  - Acceptance: kedua entry point tersedia dari Sidebar tanpa harus berpindah ke Main atau Navbar.
  - Referensi: `SPEC.md` §4, `app/(platform)/sidebars.tsx`.

- [x] **Workspace target selector untuk import**
  - Isi selector dengan semua workspace yang tersedia.
  - Default ke active workspace.
  - Import harus menulis ke workspace yang dipilih, bukan selalu workspace aktif.
  - Acceptance: user dapat mengimpor spec ke workspace lain tanpa mengubah endpoint workspace aktif.
  - Referensi: `SPEC.md` §2.1, `app/(platform)/dialog-import-spec.tsx`, `app/(platform)/use-import-spec.ts`.

- [ ] **Pertahankan endpoint dari beberapa import spec**
  - Jangan menimpa spec lama ketika spec baru diimpor ke workspace yang sama.
  - Pilih model penyimpanan yang mendukung beberapa imported specs atau gabungkan endpoint secara eksplisit.
  - Acceptance: endpoint dari import pertama tetap tersedia setelah import kedua.
  - Referensi: `SPEC.md` §1, `app/(platform)/types.ts`, `app/(platform)/workspace-store.ts`.

- [ ] **Perbaiki persistensi Manual Mode**
  - Simpan request headers yang dibuat di dialog manual.
  - Muat kembali body manual yang telah disimpan ke Request Builder.
  - Pastikan query parameters, headers, dan body tetap ada ketika endpoint dibuka kembali.
  - Acceptance: data yang diisi di `Add endpoint manually` identik dengan data yang tampil di builder.
  - Referensi: `app/(platform)/dialog-add-manual-endpoint.tsx`, `app/(platform)/playground/request-builder.tsx`, `app/(platform)/types.ts`.

- [ ] **Source type badge untuk semua endpoint**
  - Tampilkan badge/icon `spec` dan `manual` secara konsisten.
  - Acceptance: user dapat membedakan asal endpoint langsung dari daftar Sidebar.
  - Referensi: `SPEC.md` §4, `app/(platform)/sidebars.tsx`.

- [ ] **Import URL flow**
  - Tambahkan action `Fetch` pada tab URL atau dokumentasikan bahwa `Import` memang menjadi action fetch+validate.
  - Tetap tampilkan inline error dan mempertahankan dialog ketika fetch/parse gagal.
  - Referensi: `SPEC.md` §2.1, `app/(platform)/dialog-import-spec.tsx`.

- [ ] **Layout saat Sidebar collapsed**
  - Pastikan Main benar-benar mengisi ruang yang dibebaskan ketika Sidebar collapsed.
  - Verifikasi container layout tidak mempertahankan lebar kosong tetap.
  - Acceptance: lebar Main bertambah dan tidak ada blank space sidebar pada desktop.
  - Referensi: `SPEC.md` §1, `app/(platform)/layout.tsx`.

## P2 — Penyelarasan Navbar dan Dock

- [ ] **Sesuaikan struktur Navbar dengan SPEC**
  - Jadikan Import Spec CTA utama yang selalu terlihat.
  - Atur urutan aksi menjadi Avatar, Notification, lalu Import Spec dari kiri ke kanan sesuai SPEC.
  - Ganti/selaraskan wordmark `Requflow` dengan identitas produk yang ditetapkan (`SpecLess`, jika itu nama final).
  - Jadikan brand dapat kembali ke home/default workspace.
  - Referensi: `SPEC.md` §2, `app/(platform)/navbar.tsx`.

- [ ] **Account dropdown pada Avatar**
  - Tambahkan menu profile, workspace settings, dan logout placeholder untuk MVP tanpa auth.
  - Acceptance: avatar dapat diklik dan membuka dropdown.
  - Referensi: `SPEC.md` §2, `app/(platform)/navbar.tsx`.

- [ ] **Selaraskan tanggung jawab Dock**
  - Tambahkan toggle Sidebar pada Dock atau putuskan secara eksplisit bahwa Navbar menjadi pengecualian desain.
  - Tambahkan create workspace pada Dock bila struktur SPEC dipertahankan.
  - Ganti tombol `Collection` yang saat ini belum memiliki aksi atau hapus jika tidak diperlukan.
  - Referensi: `SPEC.md` §3, `app/(platform)/sidedock.tsx`.

## Fase berikutnya — jangan dianggap blocker MVP

- [ ] **Environment yang benar-benar fungsional**
  - Tambahkan base URL/variables per environment.
  - Gunakan environment aktif saat membangun dan mengeksekusi request.
  - Saat ini selector hanya mengganti `activeEnvironmentId` dan label UI.
  - Referensi: `SPEC.md` §4 dan catatan Fase 4, `app/(platform)/sidedock.tsx`, `app/(platform)/types.ts`.

- [ ] **Authentication configuration**
  - Implementasikan API key/bearer token dan integrasikan ke request headers.
  - Saat ini tab Auth masih berupa placeholder, dan SPEC menandainya sebagai Fase 4.
  - Referensi: `SPEC.md` §5, `app/(platform)/playground/request-builder.tsx`.

## Verifikasi setelah implementasi

- [ ] Jalankan lint dan type-check.
- [ ] Jalankan build production.
- [ ] Tambahkan test untuk setiap fitur baru, terutama workspace isolation, import target, history replay, dan Manual Mode.
- [ ] Verifikasi desktop: Sidebar expanded/collapsed dan Main mengisi ruang dengan benar.
- [ ] Verifikasi mobile: Sidebar dapat dibuka melalui trigger dan tidak menutupi request builder secara permanen.
