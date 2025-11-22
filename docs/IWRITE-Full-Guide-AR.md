# دليل IWRITE الشامل

**الإصدار:** 1.0  
**آخر تحديث:** نوفمبر 2025

---

## جدول المحتويات

1. [نظرة عامة على النظام](#نظرة-عامة-على-النظام)
2. [دليل الاستخدام لكل قسم](#دليل-الاستخدام-لكل-قسم)
3. [التوثيق التقني للمطورين](#التوثيق-التقني-للمطورين)
4. [تشغيل المشروع والنشر](#تشغيل-المشروع-والنشر)
5. [دليل المطورين الجدد ومعايير الكود](#دليل-المطورين-الجدد-ومعايير-الكود)

---

## نظرة عامة على النظام

### ما هو IWRITE؟

**IWRITE** هو نظام متكامل لإنشاء وإدارة المستندات الاحترافية بدعم متعدد اللغات. يجمع بين قوة الذكاء الاصطناعي ومرونة إدارة المحتوى لتقديم تجربة كاتابة احترافية.

### الميزات الأساسية

| الميزة | الوصف |
|--------|-------|
| **توليد المستندات بالذكاء الاصطناعي** | إنشاء مستندات احترافية من أفكار بسيطة باستخدام نموذج GPT-5 |
| **دعم ثلاث لغات** | العربية (AR)، الإنجليزية (EN)، الألمانية (DE) مع دعم كامل لـ RTL |
| **نماذج وقوالب قابلة للتخصيص** | إنشاء وتطبيق قوالب تصميمية مع ألوان وشعارات العلامة التجارية |
| **ملفات نمط الكتابة** | تعريف أسلوب الكتابة المفضل (نبرة، صوت، مستوى رسمية) |
| **فحص الجودة الآلي** | التحقق من المطالبات الطبية والإخلاءات والتناسق العددي |
| **إدارة الموضوعات** | تنظيم المستندات والملفات حسب الموضوعات والكلمات المفتاحية |
| **كاتب الأغاني** | إنشاء كلمات أغاني احترافية بلهجات وأنماط مختلفة |
| **التصدير متعدد الصيغ** | تصدير إلى Markdown و DOCX و PDF |

### المعمارية العامة

```
┌─────────────────────────────────────────────────────────────┐
│                        المستخدم                             │
│                    (الواجهة الأمامية)                        │
└─────────────┬───────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────┐
│              React + TypeScript + Tailwind CSS              │
│  (لوحة التحكم، محرر المستندات، إدارة الملفات)               │
└─────────────┬───────────────────────────────────────────────┘
              │
              │ RESTful API
              │
┌─────────────▼───────────────────────────────────────────────┐
│            Express.js Backend (Node.js)                     │
│  (معالجة الطلبات، التحقق من البيانات، تكامل الذكاء الاصطناعي) │
└─────────────┬───────────────────────────────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼─────────┐  ┌────▼──────────────┐
│  PostgreSQL  │  │  OpenAI / GPT-5   │
│  Database    │  │  (AI Services)    │
└──────────────┘  └───────────────────┘
```

### المكونات الرئيسية

#### الواجهة الأمامية (Frontend)
- **React 18** - مكتبة بناء الواجهات
- **TypeScript** - للأمان في الأنواع (Type Safety)
- **Tailwind CSS** - نمط التصميم المتجاوب
- **Wouter** - توجيه العميل (Client-Side Routing)
- **TanStack Query** - إدارة حالة البيانات المحققة من الخادم
- **Radix UI** - مكونات واجهة المستخدم المتقدمة

#### الخادم الخلفي (Backend)
- **Express.js** - إطار عمل خادم ويب
- **TypeScript** - برمجة محكومة بالنوع
- **Drizzle ORM** - واجهة عمل قواعد البيانات الموثوقة
- **PostgreSQL** - قاعدة البيانات الرئيسية

#### خدمات خارجية
- **OpenAI API** - للذكاء الاصطناعي وتوليد المحتوى
- **Google Cloud Storage** - لتخزين الملفات (في الإنتاج)

---

## دليل الاستخدام لكل قسم

### 1. لوحة التحكم (Dashboard)

#### الهدف
عرض ملخص سريع لإحصائيات المشروع والنشاط الأخير.

#### العناصر الرئيسية
- **إحصائيات** - عدد المستندات والملفات المرفوعة والقوالب وملفات النمط
- **النشاط الأخير** - قائمة بآخر المستندات التي تم إنشاؤها
- **إجراءات سريعة** - أزرار للانتقال السريع إلى الإنشاء والتحميل والإدارة

#### سير العمل
1. المستخدم يدخل الصفحة الرئيسية
2. يرى الإحصائيات الحالية
3. يختار إجراء من الإجراءات السريعة (إنشاء مستند، رفع ملف، إدارة القوالب)

---

### 2. قسم AI Writer (كاتب الذكاء الاصطناعي)

#### الهدف
توليد وإعادة كتابة وتحسين المستندات الاحترافية باستخدام الذكاء الاصطناعي.

#### عناصر الواجهة

| العنصر | الوصف |
|--------|-------|
| **صندوق الطلب (Prompt Box)** | منطقة نصية توضح ما تريد من المستند |
| **نوع المستند** | اختر من: مدونة، اقتراح، عقد، سياسة، عرض توضيحي، صفحة منتج، محتوى وسائل اجتماعية |
| **اللغة** | العربية (AR)، الإنجليزية (EN)، الألمانية (DE) |
| **مستوى الرسمية** | اختر مستوى الرسمية (عالي / متوسط / منخفض) |
| **طول المحتوى** | حدد الطول المفضل (قصير / متوسط / طويل) |
| **اختر قالب** | حدد قالب تصميمي (اختياري) |
| **اختر نمط كتابة** | حدد ملف نمط يحدد النبرة والصوت (اختياري) |
| **الملفات المصدر** | يمكن استخدام الملفات المرفوعة كمرجع |

#### سير العمل

```
1. المستخدم ينقر على "كاتب الذكاء الاصطناعي"
2. يكتب وصفًا للمستند المطلوب في صندوق الطلب
3. يختار نوع المستند (مدونة، عقد، إلخ)
4. يختار اللغة ومستوى الرسمية
5. (اختياري) يختار قالب ونمط كتابة
6. ينقر على "توليد المسودة"
   ↓
   [الخادم يستدعي OpenAI API]
   ↓
   يتلقى المستخدم مسودة المستند
7. يمكن تحرير المسودة أو حفظها أو إعادة التوليد
```

#### كيف يعمل الذكاء الاصطناعي

عند الطلب:
1. يتم بناء رسالة نظام (System Prompt) تتضمن:
   - نوع المستند ونبرة اللغة
   - معايير النمط (من ملف النمط إن وجد)
   - معايير القالب (من القالب إن وجد)
   - محتوى المرجع (من الملفات المرفوعة)
2. يتم إرسال الطلب إلى `openai.chat.completions.create()` مع:
   - النموذج: `gpt-5`
   - الرموز الأقصى: 8192 (حجم الاستجابة)
3. تُحفظ النتيجة كمستند جديد في قاعدة البيانات

#### الملفات المرتبطة
- `server/ai.ts` - دالة `generateDocument()`
- `POST /api/documents/generate` - نقطة النهاية (API Endpoint)
- `client/src/pages/AIWriter.tsx` - الواجهة الأمامية

---

### 3. قسم Songwriter (كاتب الأغاني)

#### الهدف
كتابة كلمات أغاني احترافية بناءً على الفكرة والنمط والهيكل.

#### عناصر الواجهة

| العنصر | الوصف |
|--------|-------|
| **فكرة الأغنية** | وصف قصير للموضوع أو الفكرة الرئيسية |
| **نوع الأغنية** | رومانسية، حزينة، تحفيزية، رسالة اجتماعية، راب/تراب، بوب/دانس، وطنية |
| **اللهجة / اللغة** | خليجي، مصري، شامي، فصحى، ألماني، إنجليزي أمريكي/بريطاني |
| **الهيكل** | مقدمة-آية-خانة-آية-خانة، آية-خانة-جسر-خانة، آيات راب-هوك، مخصص |
| **نمط القافية** | محكم (Tight)، فضفاض (Loose)، ABAB، AABB، AAAA |
| **نمط الكتابة** | حدد نمط كتابة (اختياري) |

#### سير العمل

```
1. اختيار الموضوع والنوع والهيكل
2. اختيار اللهجة ونمط القافية
3. النقر على "إنشاء الأغنية"
   ↓
   [الخادم يستدعي AI]
   ↓
4. عرض كلمات الأغنية المولدة
5. تقديم ملاحظات (جيد/سيء)
6. إعادة التوليد أو الحفظ
```

#### الملفات المرتبطة
- `client/src/pages/Songwriter.tsx` - الواجهة
- `shared/schema.ts` - أنواع الأغاني والأنماط (songTypes, songDialects, إلخ)

---

### 4. قسم Documents (المستندات)

#### الهدف
عرض وإدارة جميع المستندات المُنشأة.

#### الميزات

- **قائمة المستندات** - عرض جدول بجميع المستندات
- **البحث والفرز** - البحث برقم التعريف أو العنوان
- **معاينة** - مشاهدة محتوى المستند
- **التحرير** - تحديث محتوى المستند
- **الحذف** - حذف المستند من النظام
- **التصدير** - تحميل المستند بصيغ مختلفة (Markdown, DOCX, PDF)
- **التاريخ** - عرض إصدارات المستند السابقة

#### قاعدة البيانات

جدول `documents`:
- `id` - معرّف فريد (UUID)
- `title` - عنوان المستند
- `content` - محتوى المستند (نص طويل)
- `documentType` - نوع المستند
- `language` - اللغة (ar/en/de)
- `templateId` - معرف القالب (اختياري)
- `styleProfileId` - معرف نمط الكتابة (اختياري)
- `createdAt` - تاريخ الإنشاء
- `updatedAt` - تاريخ آخر تحديث

---

### 5. قسم File Uploads (رفع الملفات)

#### الهدف
تحميل ملفات مختلفة واستخراج النصوص منها لاستخدامها كمراجع.

#### الملفات المسموحة

| الصيغة | النوع | الوصف |
|--------|-------|-------|
| PDF | application/pdf | ملفات PDF |
| DOCX | application/vnd.openxmlformats-officedocument.wordprocessingml.document | مستندات Word |
| CSV | text/csv | ملفات البيانات المفصولة بفواصل |
| XLSX | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | ملفات Excel |
| PNG | image/png | صور PNG |
| JPEG | image/jpeg | صور JPEG |
| GIF | image/gif | صور متحركة |
| WebP | image/webp | صور WebP |

#### المحددات

- **حد الحجم الأقصى:** 50 ميجابايت
- **عدد الملفات:** حتى 10 ملفات في الطلب الواحد
- **حد المحتوى المستخرج:** 100 كيلوبايت أقصى (لتجنب مشاكل الذاكرة)

#### سير العمل

```
1. المستخدم ينقر على منطقة السحب والإفلات
2. يحدد ملفًا أو يسحبه مباشرة
3. يتم تحميل الملف على الخادم
4. يتم استخراج النص:
   - PDF → pdfjs-dist
   - DOCX → mammoth
   - CSV/XLSX → xlsx
   - الصور → يتم حفظها فقط (بدون استخراج نص)
5. يتم حفظ البيانات في جدول `uploaded_files`
6. يمكن استخدام المحتوى المستخرج في توليد المستندات
```

#### جدول قاعدة البيانات

جدول `uploaded_files`:
- `id` - معرف فريد
- `filename` - اسم الملف الأصلي
- `fileType` - صيغة الملف
- `filePath` - مسار تخزين الملف
- `extractedContent` - النص المستخرج (NULL للصور)
- `uploadedAt` - تاريخ الرفع

---

### 6. قسم Templates (القوالب)

#### الهدف
إنشاء وإدارة قوالب تصميمية قابلة لإعادة الاستخدام.

#### عناصر القالب

| الحقل | النوع | الوصف |
|-------|-------|-------|
| **اسم القالب** | نص | اسم معرّف للقالب (مثلاً "قالب HAIROTICMEN") |
| **الرأس (Header)** | نص طويل | المحتوى العلوي للمستند |
| **التذييل (Footer)** | نص طويل | المحتوى السفلي للمستند |
| **شعار العلامة** | رابط URL | رابط صورة الشعار |
| **موضع الشعار** | اختيار | أعلى اليسار / أعلى الوسط / أعلى اليمين / شريط الرأس / الجانب |
| **حجم الشعار** | اختيار | صغير / متوسط / كبير |
| **خط الرأس** | اختيار | Inter, Georgia, Cairo, Noto Sans Arabic, System UI |
| **خط النص** | اختيار | نفس الخيارات السابقة |
| **ألوان العلامة** | JSON | لون أساسي + لون ثانوي (بصيغة hex) |

#### سير العمل

```
1. الانتقال إلى قسم القوالب
2. النقر على "إنشاء قالب جديد"
3. ملء البيانات (اسم، رأس، تذييل، شعار، ألوان)
4. حفظ القالب
5. عند إنشاء مستند جديد، يمكن اختيار القالب
6. يتم تطبيق الرأس والتذييل والألوان تلقائيًا عند التصدير
```

#### الاستخدام في توليد المستندات

عند توليد مستند مع قالب:
- يتم تمرير معايير القالب (الرأس والتذييل) إلى نموذج الذكاء الاصطناعي
- عند التصدير (Markdown/DOCX)، يتم تطبيق الرأس والتذييل والألوان

---

### 7. قسم Style Profiles (ملفات النمط)

#### الهدف
تعريف أسلوب الكتابة المفضل لضمان الاتساق في المحتوى.

#### العناصر

| الحقل | الوصف |
|-------|-------|
| **اسم النمط** | اسم معرّف (مثلاً "نمط HAIROTICMEN الرسمي") |
| **حالة الاستخدام** | الاستخدام المقصود (عام، تسويق، قانوني، طبي) |
| **اللغة** | لغة النمط |
| **الإقليم** | المنطقة الجغرافية |
| **النبرة** | نبرة الكتابة (احترافي، ودود، حاد، إلخ) |
| **مستوى الرسمية** | متوازن، رسمي جداً، غير رسمي |
| **الصوت** | الشخصية المتميزة للكتابة |
| **الجمهور المستهدف** | من تكتب له |
| **الغرض** | الغرض من المستند |
| **طول الجملة** | تفضيل الجمل القصيرة أم الطويلة |
| **تفضيل الهيكل** | الترتيب المفضل للعناصر |
| **السماح برموز تعبيرية** | نعم / لا |
| **السماح باللغة العامية** | نعم / لا |
| **استخدام لغة التسويق** | نعم / لا |
| **الحاجة إلى إخلاءات قانونية** | نعم / لا |
| **العبارات المفضلة** | قائمة بالعبارات المستحسنة |
| **العبارات المحظورة** | قائمة بالعبارات المرفوضة |
| **التوجيهات** | إرشادات إضافية |

#### استخدام النمط

عند توليد أو تحرير مستند:
1. اختر نمط كتابة
2. يتم دمج معايير النمط في نموذج الذكاء الاصطناعي
3. `tone`, `voice`, `guidelines` تُمرر في System Prompt
4. يتم تطبيق القيود (العبارات المفضلة/المحظورة)

---

### 8. قسم Search (البحث)

#### الهدف
البحث عن محتوى معين عبر جميع المستندات والملفات.

#### طريقة البحث

- **بحث يعتمد على الكلمات المفتاحية** (Keyword-Based)
- **بدون تضمينات ذكية** (No AI Embeddings) لتقليل استهلاك الذاكرة

#### الآلية

```
1. المستخدم يدخل كلمة مفتاحية
2. يتم البحث في جداول:
   - document_chunks (مقاطع المستندات)
   - topics (الموضوعات)
   - entities (الكيانات المستخرجة)
3. يتم عرض النتائج مع إبراز الكلمة المفتاحية
```

#### الحماية

- **حماية من XSS** - يتم تفريغ HTML قبل إبراز النتائج

---

### 9. قسم Topics (الموضوعات)

#### الهدف
تنظيم المستندات والملفات حسب الموضوعات وتصنيفها بناءً على الكلمات المفتاحية.

#### عناصر الموضوع

| الحقل | الوصف |
|-------|-------|
| **اسم الموضوع** | اسم معرّف |
| **الوصف** | وصف تفصيلي |
| **الكلمات المفتاحية** | قائمة كلمات يُفحص وجودها لتصنيف المستندات |

#### الآلية

```
عند رفع ملف:
1. يتم تجزئة المحتوى إلى مقاطع (chunks):
   - حجم المقطع: 800 حرف
   - التداخل: 50 حرف
   - الحد الأقصى: 100 مقطع لكل ملف

2. يتم استخراج الكيانات من كل مقطع:
   - الأرقام والإحصائيات
   - التواريخ
   - المصطلحات الطبية
   - رموز المنتجات
   - اللوائح والقوانين

3. يتم ربط الملف بالموضوعات عبر الكلمات المفتاحية

4. يتم حفظ البيانات في:
   - document_chunks (المقاطع)
   - document_topics (الروابط)
   - entities (الكيانات)
```

#### حماية الذاكرة

- **حد المحتوى:** 100 كيلوبايت أقصى لكل ملف
- **عدد المقاطع:** حد أقصى 100 مقطع
- **عدد الكيانات:** 30 كيان لكل نوع، 100 كيان إجمالي

#### جداول قاعدة البيانات

```sql
-- تعريف الموضوع
topics (id, name, description, keywords[], created_at)

-- ربط الملفات بالموضوعات
document_topics (id, documentId, uploadedFileId, topicId, confidence)

-- مقاطع المستند
document_chunks (id, documentId, uploadedFileId, chunkIndex, content, heading)

-- الكيانات المستخرجة
entities (id, chunkId, entityType, value, context, metadata)
```

---

### 10. قسم Archive (الأرشيف)

#### الهدف
إرسال المستندات والملفات إلى الأرشيف بدلاً من حذفها.

#### الميزات

- **أرشفة بدلاً من الحذف** - الاحتفاظ بالمستندات في الأرشيف
- **البحث في الأرشيف** - البحث عن المستندات المؤرشفة
- **استعادة** - إعادة المستند من الأرشيف
- **حذف نهائي** - حذف دائم من الأرشيف

---

### 11. قسم Settings (الإعدادات)

#### الإعدادات المتاحة

| الإعداد | النوع | الوصف |
|---------|--------|-------|
| **اللغة** | اختيار | اختر لغة الواجهة (العربية، الإنجليزية، الألمانية) |
| **المظهر** | اختيار | الوضع الفاتح أم الداكن |
| **منطقة زمنية** | اختيار | لتصحيح التواريخ والأوقات |

#### حفظ التفضيلات

تُحفظ التفضيلات في **localStorage** للعميل:
```javascript
localStorage.setItem('language', 'ar'); // أو 'en' أو 'de'
localStorage.setItem('theme', 'dark');  // أو 'light'
```

---

## التوثيق التقني للمطورين

### بنية المشروع

```
iwrite/
├── client/                          # الواجهة الأمامية (React)
│   ├── src/
│   │   ├── components/              # مكونات React المشتركة
│   │   │   ├── AppSidebar.tsx       # الشريط الجانبي الرئيسي
│   │   │   ├── Header.tsx           # رأس الصفحة
│   │   │   ├── LanguageProvider.tsx # مزود لغة التطبيق
│   │   │   ├── ThemeProvider.tsx    # مزود المظهر (فاتح/داكن)
│   │   │   └── ui/                  # مكونات Shadcn/UI
│   │   ├── pages/                   # صفحات التطبيق
│   │   │   ├── Dashboard.tsx        # لوحة التحكم
│   │   │   ├── AIWriter.tsx         # كاتب الذكاء الاصطناعي
│   │   │   ├── Songwriter.tsx       # كاتب الأغاني
│   │   │   ├── Documents.tsx        # إدارة المستندات
│   │   │   ├── Templates.tsx        # إدارة القوالب
│   │   │   ├── StyleProfiles.tsx    # إدارة أنماط الكتابة
│   │   │   ├── Uploads.tsx          # إدارة الملفات
│   │   │   ├── Topics.tsx           # إدارة الموضوعات
│   │   │   ├── TopicPack.tsx        # حزمة الموضوع
│   │   │   ├── TopicSearch.tsx      # البحث في الموضوعات
│   │   │   ├── Archive.tsx          # الأرشيف
│   │   │   └── DocumentEditor.tsx   # محرر المستند
│   │   ├── lib/                     # دوال مساعدة
│   │   │   └── queryClient.ts       # إعدادات React Query
│   │   ├── hooks/                   # hooks مخصصة
│   │   ├── App.tsx                  # المكون الرئيسي
│   │   ├── main.tsx                 # نقطة الدخول
│   │   └── index.css                # الأسلوب العام
│   ├── index.html                   # ملف HTML الرئيسي
│   └── tsconfig.json
│
├── server/                          # الخادم الخلفي (Express)
│   ├── index.ts                     # نقطة الدخول الرئيسية
│   ├── routes.ts                    # تعريف API endpoints
│   ├── storage.ts                   # واجهة قاعدة البيانات
│   ├── ai.ts                        # تكامل OpenAI
│   ├── fileProcessing.ts            # معالجة الملفات
│   ├── export.ts                    # تصدير المستندات
│   ├── vite.ts                      # إعدادات Vite
│   └── topic-intelligence/          # خدمة ذكاء الموضوعات
│       ├── chunker.ts               # تجزئة المستندات
│       └── entityExtractor.ts       # استخراج الكيانات
│
├── shared/                          # الكود المشترك
│   └── schema.ts                    # تعريفات البيانات والأنواع
│
├── package.json                     # اعتماديات المشروع
├── tsconfig.json                    # إعدادات TypeScript
├── vite.config.ts                   # إعدادات Vite
├── tailwind.config.ts               # إعدادات Tailwind
└── drizzle.config.ts                # إعدادات Drizzle ORM
```

### نموذج قاعدة البيانات

#### الجداول الرئيسية

| الجدول | الوصف | الحقول الرئيسية |
|--------|-------|-----------------|
| **documents** | المستندات المُنشأة | id, title, content, documentType, language, templateId, styleProfileId |
| **templates** | القوالب | id, name, header, footer, logoUrl, brandColors |
| **styleProfiles** | أنماط الكتابة | id, name, tone, voice, formalityLevel, guidelines |
| **uploadedFiles** | الملفات المرفوعة | id, filename, filePath, extractedContent |
| **documentVersions** | إصدارات المستندات | id, documentId, version, content, changeSummary |
| **qaCheckResults** | نتائج فحص الجودة | id, documentId, checkType, status, issues |
| **topics** | الموضوعات | id, name, description, keywords |
| **documentChunks** | مقاطع المستندات | id, documentId, chunkIndex, content |
| **entities** | الكيانات المستخرجة | id, chunkId, entityType, value, context |
| **documentTopics** | ربط المستندات بالموضوعات | id, documentId, topicId, confidence |
| **topicPacks** | حزم الموضوعات | id, topicId, name, terminologyMap, priorityRules |

---

### API Endpoints

#### لوحة التحكم
```
GET /api/dashboard/stats
  استجابة: { documents: number, uploads: number, templates: number, styleProfiles: number }

GET /api/dashboard/activity
  استجابة: Array<{ title: string, timestamp: string }>
```

#### المستندات
```
GET /api/documents
  استجابة: Array<Document>

GET /api/documents/:id
  استجابة: Document

POST /api/documents/generate
  جسم الطلب: { documentType, language, prompt, templateId?, styleProfileId? }
  استجابة: Document

PUT /api/documents/:id
  جسم الطلب: { title?, content?, documentType?, language?, ... }
  استجابة: Document

DELETE /api/documents/:id
  استجابة: { success: boolean }

POST /api/documents/:id/rewrite
  جسم الطلب: { styleProfileId?, removeDuplication? }
  استجابة: Document

POST /api/documents/:id/translate
  جسم الطلب: { targetLanguage, styleProfileId? }
  استجابة: Document (نسخة مترجمة)

POST /api/documents/:id/qa-check
  جسم الطلب: { checkType: "medical-claims" | "disclaimer" | "number-consistency" | "product-code-cnpn" }
  استجابة: QACheckResult

GET /api/documents/:id/qa-results
  استجابة: Array<QACheckResult>

POST /api/documents/:id/export
  جسم الطلب: { format: "md" | "docx" | "pdf" }
  استجابة: (ملف بصيغة الطلب)
```

#### القوالب
```
GET /api/templates
  استجابة: Array<Template>

POST /api/templates
  جسم الطلب: { name, header?, footer?, logoUrl?, ... }
  استجابة: Template

PUT /api/templates/:id
  جسم الطلب: { ...نفس الحقول أعلاه }
  استجابة: Template

DELETE /api/templates/:id
  استجابة: { success: boolean }
```

#### أنماط الكتابة
```
GET /api/style-profiles
  استجابة: Array<StyleProfile>

POST /api/style-profiles
  جسم الطلب: { name, tone, voice, guidelines?, ... }
  استجابة: StyleProfile

PUT /api/style-profiles/:id
  جسم الطلب: {...نفس الحقول}
  استجابة: StyleProfile

DELETE /api/style-profiles/:id
  استجابة: { success: boolean }

POST /api/style-profiles/:id/preview
  استجابة: { preview: string }
```

#### الملفات المرفوعة
```
GET /api/uploads
  استجابة: Array<UploadedFile>

POST /api/uploads
  محتوى: multipart/form-data مع ملفات
  استجابة: Array<UploadedFile>

DELETE /api/uploads/:id
  استجابة: { success: boolean }
```

#### الموضوعات
```
GET /api/topics
  استجابة: Array<Topic>

POST /api/topics
  جسم الطلب: { name, description?, keywords? }
  استجابة: Topic

GET /api/topics/:id
  استجابة: Topic

GET /api/topics/:id/chunks
  استجابة: Array<DocumentChunk>

GET /api/topics/:id/entities
  استجابة: Array<Entity>

GET /api/topics/search
  استجابة: Array<SearchResult>
```

---

### طبقة الذكاء الاصطناعي

#### الملف الرئيسي: `server/ai.ts`

##### دالة generateDocument()

```typescript
async generateDocument(params: {
  documentType: string;      // blog, proposal, contract, ...
  language: string;           // ar, en, de
  prompt: string;             // طلب المستخدم
  template?: { header?, footer? };
  styleProfile?: { tone, voice, guidelines? };
  sourceContent?: string;     // محتوى مرجعي من الملفات المرفوعة
}): Promise<string>
```

**الآلية:**
1. بناء System Prompt يتضمن:
   - نوع المستند واللغة
   - معايير النمط (إن وجدت)
   - محتوى القالب (إن وجد)
   - المحتوى المرجعي
2. استدعاء `openai.chat.completions.create()`:
   - النموذج: `gpt-5`
   - `max_completion_tokens: 8192`
3. إرجاع محتوى المستند

##### دالة rewriteDocument()

```typescript
async rewriteDocument(params: {
  content: string;
  language: string;
  styleProfile?: { tone, voice, guidelines? };
  removeDuplication: boolean;
}): Promise<string>
```

**الهدف:** تحسين وإعادة صياغة المحتوى الموجود

##### دالة translateDocument()

```typescript
async translateDocument(params: {
  content: string;
  sourceLanguage: string;     // ar, en, de
  targetLanguage: string;     // ar, en, de
  styleProfile?: { tone, voice, guidelines? };
}): Promise<string>
```

**الهدف:** ترجمة المستند مع الحفاظ على النمط

##### دالة performQACheck()

```typescript
async performQACheck(params: {
  content: string;
  checkType: "medical-claims" | "disclaimer" | "number-consistency" | "product-code-cnpn";
}): Promise<{
  status: "passed" | "warning" | "failed";
  issues: Array<{ description, severity, suggestion }>;
}>
```

**فحوصات متاحة:**
- **medical-claims** - تحديد المطالبات الطبية
- **disclaimer** - التحقق من الإخلاءات القانونية
- **number-consistency** - تناسق الأرقام والإحصائيات
- **product-code-cnpn** - التحقق من رموز المنتجات

##### معالجة الأخطاء والـ Rate Limiting

```typescript
// استخدام p-retry للتعامل مع تجاوز حدود المعدل
pRetry(async () => { ... }, {
  retries: 7,
  minTimeout: 2000,      // 2 ثانية
  maxTimeout: 128000,    // 128 ثانية
  factor: 2              // مضاعفة التوقيت
})
```

---

### معالجة الملفات

#### الملف: `server/fileProcessing.ts`

```typescript
async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string>
```

**معالجة الصيغ:**

| الصيغة | المكتبة | الطريقة |
|--------|---------|--------|
| PDF | `pdfjs-dist` | استخراج النص من كل صفحة |
| DOCX | `mammoth` | تحويل الـ XML إلى نص |
| CSV | `xlsx` | قراءة الصفوف والأعمدة |
| XLSX | `xlsx` | قراءة الجداول |
| الصور | N/A | حفظ فقط (بدون استخراج) |

---

### دعم اللغات والتدويل

#### آليات RTL/LTR

في الواجهة الأمامية:
```html
<html lang="ar" dir="rtl">    <!-- للعربية -->
<html lang="en" dir="ltr">    <!-- للإنجليزية -->
<html lang="de" dir="ltr">    <!-- للألمانية -->
```

#### ملفات الترجمة

مخزنة في مكونات React كـ objects:
```typescript
const translations = {
  en: { dashboard: "Dashboard", ... },
  ar: { dashboard: "لوحة التحكم", ... },
  de: { dashboard: "Dashboard", ... },
}
```

#### تبديل اللغة

يتم إدارته عبر Context API:
```typescript
<LanguageProvider>
  {/* استخدم useLanguage() للوصول إلى اللغة الحالية */}
</LanguageProvider>
```

---

### الأمان

#### حماية المدخلات

- **Zod Validation** - للتحقق من صحة جسم الطلب
- **Multer File Filter** - للتحقق من صيغ الملفات المسموحة

#### إدارة مفاتيح API

- **OpenAI API Key** - محفوظ في بيئة الخادم فقط (`AI_INTEGRATIONS_OPENAI_API_KEY`)
- **Database URL** - محفوظ في `DATABASE_URL`
- **Storage Bucket** - محفوظ في `DEFAULT_OBJECT_STORAGE_BUCKET_ID`

#### CORS و Rate Limiting

تُطبق على مستوى الخادم (إذا لزم الأمر)

---

## تشغيل المشروع والنشر

### المتطلبات

- **Node.js** 18+ أو Bun
- **PostgreSQL** (أو استخدام قاعدة بيانات Replit المدمجة)
- **OpenAI API Key** (أو Replit AI Integrations)

### أوامر التشغيل الأساسية

```bash
# تثبيت الاعتماديات
npm install

# التطوير (الخادم والعميل معاً)
npm run dev
# يفتح على: http://localhost:5000

# التحقق من الأنواع
npm run check

# البناء للإنتاج
npm run build

# تشغيل الإنتاج
npm run start

# دفع تغييرات قاعدة البيانات
npm run db:push
```

### متغيرات البيئة

أنشئ ملف `.env.local`:

```env
# قاعدة البيانات (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OpenAI API (Replit)
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...

# Google Cloud Storage (الإنتاج فقط)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id

# بيئة التشغيل
NODE_ENV=development
```

### سيناريو التشغيل السريع

```bash
# 1. استنساخ المستودع
git clone https://github.com/your-repo/iwrite.git
cd iwrite

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد البيئة
cp .env.example .env.local
# عدّل .env.local وأضف المفاتيح

# 4. إنشاء قاعدة البيانات
npm run db:push

# 5. تشغيل التطوير
npm run dev

# 6. افتح المتصفح
# http://localhost:5000
```

### النشر على Replit

1. ادفع الكود إلى GitHub
2. اربط المستودع مع Replit
3. أضف متغيرات البيئة في Secrets
4. انقر على "Publish" لنشر التطبيق

---

## دليل المطورين الجدد ومعايير الكود

### أسلوب الكود

#### TypeScript

- استخدم أنواع صريحة دائماً
- تجنب `any` قدر الإمكان
- استخدم `interface` للبيانات الرئيسية

#### تسمية الملفات والمجلدات

```
✓ components/AppSidebar.tsx         # PascalCase للمكونات
✓ lib/queryClient.ts                # camelCase للملفات العادية
✓ pages/AIWriter.tsx                # PascalCase للصفحات
✓ server/fileProcessing.ts          # camelCase للخدمات
```

#### تسمية المتغيرات والدوال

```typescript
// ✓ صحيح
const getUserById = async (userId: string) => { ... }
const isDocumentValid = true;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ✗ خطأ
const get_user_by_id = async (user_id: string) => { ... }
const is-document-valid = true;
```

---

### إضافة ميزة جديدة

#### خطوات العمل

```
1. إنشاء Schema في shared/schema.ts
   ├─ Drizzle table definition
   ├─ Insert schema
   └─ Types

2. إضافة Storage Methods في server/storage.ts
   ├─ getAllXxx()
   ├─ getXxxById()
   ├─ createXxx()
   ├─ updateXxx()
   └─ deleteXxx()

3. إضافة API Routes في server/routes.ts
   ├─ GET /api/xxx
   ├─ POST /api/xxx
   ├─ PUT /api/xxx/:id
   └─ DELETE /api/xxx/:id

4. إنشاء React Component في client/src/pages/ أو components/
   ├─ استخدم useQuery() لـ GET
   ├─ استخدم useMutation() لـ POST/PUT/DELETE
   └─ أضف data-testid لكل عنصر تفاعلي

5. تسجيل Route في client/src/App.tsx

6. اختبار محلياً
   - npm run dev
   - اختبر جميع CRUD operations
```

#### مثال: إضافة "ميزة جديدة"

**1. Schema:**
```typescript
// shared/schema.ts
export const newFeatures = pgTable("new_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNewFeatureSchema = createInsertSchema(newFeatures).pick({
  name: true,
  description: true,
});
```

**2. Storage:**
```typescript
// server/storage.ts
async getAllNewFeatures(): Promise<NewFeature[]> {
  return db.select().from(schema.newFeatures);
}

async createNewFeature(data: InsertNewFeature): Promise<NewFeature> {
  return db.insert(schema.newFeatures).values(data).returning();
}
```

**3. Route:**
```typescript
// server/routes.ts
app.get("/api/new-features", async (req, res) => {
  const features = await storage.getAllNewFeatures();
  res.json(features);
});

app.post("/api/new-features", async (req, res) => {
  const validation = insertNewFeatureSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: validation.error });
  
  const feature = await storage.createNewFeature(validation.data);
  res.json(feature);
});
```

**4. Component:**
```typescript
// client/src/pages/NewFeatures.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function NewFeatures() {
  const { data: features, isLoading } = useQuery({
    queryKey: ["/api/new-features"],
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch("/api/new-features", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/new-features"] }),
  });

  return (
    <div>
      {isLoading && <p>جاري التحميل...</p>}
      {features?.map(f => (
        <div key={f.id} data-testid={`card-feature-${f.id}`}>
          <h3>{f.name}</h3>
          <p>{f.description}</p>
        </div>
      ))}
    </div>
  );
}
```

**5. تسجيل الـ Route:**
```typescript
// client/src/App.tsx
import NewFeatures from "@/pages/NewFeatures";

<Route path="/new-features" component={NewFeatures} />
```

---

### التعامل مع الذكاء الاصطناعي

#### بناء Prompt فعال

```typescript
// ✓ جيد
let systemPrompt = `You are an expert professional writer creating blog documents in Arabic.

Style Guidelines:
- Tone: ${styleProfile.tone}
- Voice: ${styleProfile.voice}

Generate a complete, well-structured document based on the user's request.`;

// ✗ سيء
let systemPrompt = `Write something`;
```

#### تحديد المعايير

- **max_completion_tokens:** لا تتجاوز 8192 للوثائق العادية
- **temperature:** اتركها بالقيمة الافتراضية (1.0)
- **top_p:** استخدم 1.0 للإبداعية، 0.1 للدقة

---

### معايير الاختبار

#### اختبار محلي

```bash
# 1. تشغيل التطوير
npm run dev

# 2. اختبر في المتصفح
http://localhost:5000

# 3. افتح DevTools (F12)
# - تحقق من عدم وجود أخطاء
# - تحقق من طلبات API (Network tab)

# 4. اختبر جميع الأقسام
# - Dashboard، AI Writer، Songwriter، إلخ
```

#### معايير قبول الميزة

- ✓ جميع عمليات CRUD تعمل
- ✓ لا توجد أخطاء في Console
- ✓ الـ API endpoints ترد 200 / 201 (نجاح)
- ✓ البيانات تُحفظ في قاعدة البيانات
- ✓ جميع العناصر التفاعلية لها `data-testid`
- ✓ الواجهة تستجيب للغات الثلاث (AR/EN/DE)

---

### Git Workflow (اقتراح)

```bash
# 1. عمل فرع جديد
git checkout -b feature/new-feature

# 2. اعمل على الميزة
# ... تطوير

# 3. التزم بالتغييرات
git add .
git commit -m "feat: إضافة ميزة جديدة"

# 4. ادفع الفرع
git push origin feature/new-feature

# 5. افتح Pull Request
# - اشرح ما فعلت
# - اطلب review
```

#### رسائل Commit

```
feat: إضافة ميزة جديدة
fix: إصلاح خطأ في ...
docs: تحديث التوثيق
style: تحسين الأسلوب
refactor: إعادة هيكلة ...
test: إضافة اختبارات
```

---

### مراجع إضافية

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TanStack Query Docs](https://tanstack.com/query)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com)

---

**انتهى الدليل الشامل لـ IWRITE**

