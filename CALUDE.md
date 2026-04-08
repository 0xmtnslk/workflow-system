# GWS - Generic Workflow System
## Teknik Mimari ve Planlama Dokümanı

---

## 1. Genel Bakış

GWS (Generic Workflow System), kurumlar içindeki iş akışlarını dijital ortamda tasarlamak, yönetmek ve takip etmek için geliştirilmiş esnek bir workflow planlama ve takip aracıdır. Sistem; sıralı ve paralel adımları destekler, birim bazlı görev ataması yapar ve anlık ilerleme takibi sağlar.

---

## 2. Genel Mimari

```
Docker Compose
├── frontend        (React + TypeScript + shadcn/ui)
├── backend         (NestJS + TypeScript)
├── postgres        (Ana veritabanı)
├── redis           (Queue + real-time state)
└── nginx           (Reverse proxy)
```

### Backend-Frontend Bağlantısı
- **REST API** → CRUD işlemleri, workflow yönetimi
- **WebSocket (Socket.io)** → Anlık adım güncellemeleri, in-app bildirimler
- REST tercih sebebi: AD entegrasyonu ve ileride mobil uygulama için açık mimari

---

## 3. Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| **Super Admin** | Workflow şablonu tasarlar, kullanıcı/birim yönetir, sistem ayarlarını yapar |
| **Yönetici (Manager)** | Workflow instance başlatır, ilerlemeyi takip eder, bildirim alır |
| **Çalışan (Worker)** | Kendine atanan adımlardaki görevleri tamamlar |

---

## 4. Organizasyon Hiyerarşisi

```
Üst Yönetim
└── Müdür / Müdür Yardımcısı
    └── Sorumlu
        └── Uzman
            └── Uzman Yardımcısı
```

> Hiyerarşi bildirim/eskalasyon için değil, organizasyonel yapı için kullanılır.
> Eskalasyon bildirimi yalnızca workflow'u başlatan yöneticiye gider.

---

## 5. Veri Modeli

### User
```
User
├── id
├── name
├── email
├── passwordHash
├── role: SUPER_ADMIN | MANAGER | WORKER
├── departmentId
└── adUsername  ← AD entegrasyonu için hazır
```

### Department
```
Department
└── id, name, parentId  ← hiyerarşi için
```

### WorkflowTemplate
```
WorkflowTemplate
├── id, name, description
├── status: ACTIVE | PASSIVE | ARCHIVED
└── parameters: JSON  ← tetikleme parametrelerinin tanımı
```

### Step (Şablon Adımı)
```
Step
├── id, workflowTemplateId
├── name, order, duration (gün, default: 1)
├── isParallel
├── dependsOn: Step[]  ← DAG bağımlılıkları
└── assignedDepartmentId
```

### Task (Adım İçi Görev)
```
Task
├── id, stepId, label, order
├── type: CHECKBOX | YES_NO | TEXT | FILE_UPLOAD
└── isRequired, fileTypes (pdf/jpeg/png)
```

### WorkflowInstance (Tetiklenmiş İş Akışı)
```
WorkflowInstance
├── id, templateId
├── triggeredBy (Manager)
├── parameters: JSON  ← doktor adı, tarih vs.
├── status: RUNNING | COMPLETED | ARCHIVED
└── startedAt, completedAt
```

### StepInstance
```
StepInstance
├── id, workflowInstanceId, stepId
├── status: WAITING | IN_PROGRESS | COMPLETED
├── assignedUserId  ← üstlenen kişi
├── startedAt, dueAt, completedAt
└── isEscalated
```

### TaskResponse
```
TaskResponse
├── id, stepInstanceId, taskId
├── responseValue: JSON  ← checkbox true/false, text, dosya yolu
└── respondedBy, respondedAt
```

### Notification
```
Notification
├── id, userId
├── type: IN_APP | EMAIL
├── title, message, isRead
└── relatedInstanceId
```

### SystemConfig
```
SystemConfig
├── smtpHost, smtpPort
├── smtpUser, smtpPassword
├── smtpFromName, smtpFromEmail
└── adEnabled, adHost, adBaseDN  ← AD entegrasyonu için hazır
```

---

## 6. Workflow Engine Mantığı

```
Workflow Başlatılır
        ↓
DAG analiz edilir → Bağımlılığı olmayan adımlar başlatılır
        ↓
Paralel adımlar aynı anda IN_PROGRESS olur
        ↓
Bir adım tamamlandığında:
  → Bağımlı adımların tüm dependency'leri bitti mi?
      EVET → O adımı başlat, birime bildirim gönder
      HAYIR → Bekle
        ↓
Tüm adımlar tamamlandığında:
  → Instance COMPLETED
  → Yöneticiye mail + in-app bildirim
```

### Deadline Engine (Redis + Bull Queue)
- Her adım başladığında Redis'e `dueAt` ile job eklenir
- Süre dolduğunda otomatik eskalasyon → workflow'u başlatan yöneticiye mail + in-app bildirim

### Paralel Adım Örneği
> "A Birimi ve B Birimi aynı anda çalışıyor. İkisi de bitince C Birimi başlıyor."
> Bu yapı DAG (Directed Acyclic Graph) engine ile yönetilir.

---

## 7. Görev Tipleri

| Tip | Açıklama |
|---|---|
| **CHECKBOX** | Tamamlandı işareti |
| **YES_NO** | Evet / Hayır seçimi |
| **TEXT** | Serbest metin girişi |
| **FILE_UPLOAD** | Dosya yükleme (PDF, JPEG, PNG) — zorunlu olarak işaretlenebilir |

---

## 8. Dosya Depolama

- **Yöntem:** Docker Volume (sunucu disk)
- Desteklenen formatlar: PDF, JPEG, PNG
- Dosya yolları veritabanında `TaskResponse.responseValue` içinde tutulur

---

## 9. Bildirim Tetikleyicileri

| Olay | Bildirim Türü | Alıcı |
|---|---|---|
| Adım atandığında | In-app + E-posta | İlgili birim çalışanları |
| Adım tamamlandığında | In-app | Yönetici |
| Deadline aşıldığında | In-app + E-posta | Workflow'u başlatan yönetici |
| Workflow tamamlandığında | In-app + E-posta | Workflow'u başlatan yönetici |

---

## 10. Frontend Sayfa Yapısı

```
/login                        ← Giriş
/dashboard                    ← Rol bazlı ana ekran

/admin/users                  ← Kullanıcı yönetimi (SuperAdmin)
/admin/departments            ← Birim yönetimi (SuperAdmin)
/admin/settings               ← SMTP ve sistem ayarları (SuperAdmin)

/workflows                    ← Şablon listesi (aktif/pasif/arşiv)
/workflows/new                ← Görsel designer (React Flow)
/workflows/:id/edit           ← Düzenleme
/workflows/:id/copy           ← Kopyalayarak yeni şablon

/instances                    ← Aktif iş akışları
/instances/:id                ← Akış diyagramı + renkli ilerleme
/instances/new                ← Workflow tetikleme formu

/my-tasks                     ← Çalışan görev listesi
/my-tasks/:stepInstanceId     ← Görev tamamlama ekranı

/notifications                ← Bildirim merkezi
```

---

## 11. Görsel Workflow Designer (React Flow)

```
Adım Ekle → Sürükle & Bırak ile konumlandır
     ↓
Adımlar arası ok çiz → Bağımlılık tanımlanır
     ↓
Adıma tıkla → Sağ panel açılır:
  - Adım adı, süre (default: 1 gün), atanan birim
  - Görev ekle: CHECKBOX / YES_NO / TEXT / FILE_UPLOAD
  - Zorunluluk ayarı
     ↓
Kaydet → Şablon oluşur
```

### Renk Kodlaması (Instance Takip Ekranı)
| Renk | Durum |
|---|---|
| 🟡 Sarı | Bekliyor (WAITING) |
| 🔵 Mavi | Devam ediyor (IN_PROGRESS) |
| 🟢 Yeşil | Tamamlandı (COMPLETED) |
| 🔴 Kırmızı | Süresi aşıldı (ESCALATED) |

---

## 12. Docker Compose Servisleri

| Servis | Image | Port |
|---|---|---|
| frontend | node:20-alpine | 3000 |
| backend | node:20-alpine | 3001 |
| postgres | postgres:16 | 5432 |
| redis | redis:7-alpine | 6379 |
| nginx | nginx:alpine | 80 / 443 |

---

## 13. Active Directory (AD) Entegrasyonu

- Şu an kullanıcı adı/şifre ile giriş aktif
- AD entegrasyonu için gerekli alanlar (`adUsername`, `adHost`, `adBaseDN`) veri modelinde hazır tutulmuştur
- `SystemConfig` tablosunda `adEnabled` flag'i ile ileride aktif edilebilir

---

## 14. Teknoloji Stack Özeti

| Katman | Teknoloji |
|---|---|
| Frontend | React, TypeScript, shadcn/ui, React Flow |
| Backend | NestJS, TypeScript |
| Veritabanı | PostgreSQL 16 |
| Cache / Queue | Redis 7 + Bull |
| Real-time | Socket.io |
| E-posta | Nodemailer (SMTP) |
| Dosya Depolama | Docker Volume |
| Proxy | Nginx |
| Container | Docker Compose |
| Dil | Türkçe |

---

*GWS Teknik Planlama Dokümanı — v1.0*
