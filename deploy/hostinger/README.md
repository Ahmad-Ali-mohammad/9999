# نشر على Hostinger VPS (دليل سريع)

هذا الدليل يشرح خطوات نشر التطبيق على Hostinger VPS باستخدام Docker وdocker-compose، مع إعداد nginx كعكس وكيل (reverse proxy) وLet's Encrypt SSL.

الافتراضات:
- لديك وصول root أو مستخدم مع صلاحيات sudo على VPS.
- Docker و docker-compose مثبتان على الـ VPS.
- لديك نطاق domain.com وتريد توجيهه إلى الـ VPS.

الخطوات الأساسية:

1) إعداد السيرفر

- تحديث النظام وتثبيت Docker / Docker Compose (إن لم يكن مثبتًا):
  ```bash
  sudo apt update && sudo apt upgrade -y
  curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
  sudo apt-get install -y docker-compose-plugin
  ```

2) نسخ المشروع إلى الـ VPS

- استخدم git أو rsync لنسخ الملفات إلى المسار الذي تريد (مثال /opt/money-way):
  ```bash
  sudo mkdir -p /opt/money-way
  sudo chown $USER:$USER /opt/money-way
  git clone <repo_url> /opt/money-way
  cd /opt/money-way
  ```

3) تهيئة متغيرات البيئة

- على الـ VPS، أنشئ ملف `backend/.env.production` بناءً على `backend/.env.production.example` وتأكد من ضبط قيم صحيحة:
  ```env
  DATABASE_URL="mysql://app:secure_password@db:3306/finance_db"
  JWT_SECRET="انتبه_للوضع_قيمة_قوية"
  PORT=4000
  NODE_ENV=production
  ```

4) (خيار) استخدام قاعدة بيانات MySQL كحاوية محليًا أو خدمة مُدارة

- docker-compose.prod.yml الذي أعددناه يحتوي خدمة `db` (MySQL). يمكنك استخدامه كبداية. لاحقًا لو أردت نقل DB لخدمة مُدارة حدّث `DATABASE_URL` على نفس النمط مع بيانات الموفر.

5) تشغيل الحاويات

- في المسار الجذري للمشروع على الـ VPS شغّل:
  ```bash
  sudo docker compose -f docker-compose.prod.yml up -d --build
  ```

6) إعداد nginx على الـ VPS (عكس الوكيل)

- أنشئ ملف إعداد nginx في `/etc/nginx/sites-available/finance` مع التكوين المضمّن في `deploy/hostinger/nginx.conf`.
- فعّل الموقع وأعد تحميل nginx:
  ```bash
  sudo ln -s /etc/nginx/sites-available/finance /etc/nginx/sites-enabled/finance
  sudo nginx -t && sudo systemctl reload nginx
  ```

7) الحصول على شهادة SSL مع Certbot

- تثبيت certbot وتهيئته:
  ```bash
  sudo apt install certbot python3-certbot-nginx -y
  sudo certbot --nginx -d example.com -d www.example.com
  ```

8) تشغيل المهاجرات والتهيئة

- إن لم تُشغّل migrations تلقائياً، نفّذ:
  ```bash
  cd backend
  npx prisma migrate deploy
  ```

9) تشغيل الخدمة تلقائيًا عند إعادة التشغيل (اختياري)

- يمكن استخدام systemd service لتشغيل docker compose أو اعتماد docker's restart policies (أدناه مثال خدمة systemd بسيطة).

10) مراقبة ونسخ احتياطي

- جهّز نسخ احتياطي لقواعد البيانات بشكل دوري.
- تأكد من جدران الحماية (UFW) تفتح المنافذ الضرورية فقط (80 و443 و ssh 22).


---

إذا تريدي، أستطيع:
- توليد ملف إعداد nginx مهيأ لنطاقك (أعطني `your-domain.com`).
- إنشاء سكربت نشر واحد تنفيذه على الـ VPS لتسهيل النشر.
- إعداد systemd unit لتشغيل docker-compose تلقائيًا.
