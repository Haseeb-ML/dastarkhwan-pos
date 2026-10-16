from pathlib import Path
import json
pairs='''New Order|نیا آرڈر
Naya Order|نیا آرڈر
Orders & Kitchen|آرڈر اور باورچی خانہ
Orders / Rasoi|آرڈر اور باورچی خانہ
Menu|کھانے اور قیمتیں
Khanay / Rates|کھانے اور قیمتیں
Customers|گاہک اور ادھار
Gahak / Udhaar|گاہک اور ادھار
Stock & Purchases|سامان اور خریداری
Stock / Khareed|سامان اور خریداری
Daily Summary|آمدن اور خرچ
Munafa / Hisaab|آمدن اور خرچ
Settings|ترتیبات
Setting|ترتیبات
Dastarkhwan|دسترخوان
Desi Kitchen|دیسی کھانے
All|سب کھانے
Karahi & Handi|کڑاہی اور ہانڈی
Biryani & Pulao|بریانی اور چاول
BBQ & Sajji|تکہ، کباب اور سجی
Paratha & Breads|پراٹھا، نان اور روٹی
Daal & Sabzi|دال اور سبزی
Sides|رائتہ اور سلاد
Breakfast & Specials|ناشتہ اور خاص کھانے
Desserts|میٹھا
Drinks|مشروبات
Chicken Karahi|چکن کڑاہی
Mutton Karahi|مٹن کڑاہی
White Chicken Karahi|سفید چکن کڑاہی
Chicken Handi|چکن ہانڈی
Chicken Biryani|چکن بریانی
Beef Biryani|بیف بریانی
Chicken Pulao|چکن پلاؤ
Chicken Tikka|چکن تکہ
Seekh Kabab|سیخ کباب
Chicken Sajji|چکن سجی
Roghni Naan|روغنی نان
Plain Naan|سادہ نان
Daal Mash|دال ماش
Aloo Qeema|آلو قیمہ
Raita|رائتہ
Halwa Puri|حلوہ پوری
Kheer|کھیر
Soft Drink|ٹھنڈا مشروب
Plain Paratha|سادہ پراٹھا
Aloo Paratha|آلو پراٹھا
Qeema Paratha|قیمہ پراٹھا
Tandoori Roti|تندوری روٹی
Plain Rice|سادہ چاول
Daal Chawal|دال چاول
Nihari|نہاری
Haleem|حلیم
Half|آدھی
Full|پوری
Plate|پلیٹ
Piece|عدد
Bowl|پیالی
Bottle|بوتل
Regular|ایک پلیٹ
portion|حصہ
piece|عدد
kg|کلو
litre|لیٹر
bowl|پیالی
bottle|بوتل
Dine-in|یہیں کھانا
Yahin khana|یہیں کھانا
Takeaway|پارسل
Parcel|پارسل
Aap ka order|آپ کا آرڈر
Saaf karein|سب ہٹائیں
khanay|کھانے
dishes|کھانے
Table|میز
Table chunein|میز منتخب کریں
Parcel ka number bill par ayega|پارسل کا نمبر بل پر آئے گا
+ Gahak ka naam / mobile|گاہک کا نام یا موبائل، اگر ضرورت ہو
Customer (optional)|گاہک کا نام، اگر ضرورت ہو
Walk-in guest|عام گاہک
+ Add customer|نیا گاہک
Your order is empty|ابھی کوئی کھانا نہیں چنا
Select dishes from the menu.|کھانے کی تصویر دبائیں، وہ آرڈر میں آ جائے گا۔
Rasoi ko hidayat|باورچی کے لیے بات
Kitchen note (optional)|مثلاً مرچ کم رکھیں
Khanay ki raqam|کھانوں کی رقم
Discount dein|رعایت
Discount PKR|رعایت، روپے
Tax & service|ٹیکس اور اضافی رقم
Total|کل رقم
Additions total|نئے کھانوں کی رقم
Order rok dein|آرڈر روکیں
Bill banayein|بل بنائیں
Order & Bill|بل بنائیں
Save additions|کھانا شامل کریں
Khana add karein|کھانا شامل کریں
Save ho raha hai…|محفوظ ہو رہا ہے…
Saving…|محفوظ ہو رہا ہے…
Khana dhoondein…|کھانے کا نام لکھیں…
Kya order lena hai?|کون سا کھانا چاہیے؟
Photo dabayein. Half / Full chunein. Bill banayein.|۱۔ کھانا چنیں   ۲۔ تعداد بتائیں   ۳۔ بل بنائیں
+ Order mein dalein|آرڈر میں شامل کریں
Aaj khatam|آج دستیاب نہیں
Apni photo add karein|اپنی تصویر لگائیں
No dishes match your search.|اس نام کا کھانا نہیں ملا۔
× Close order|آرڈر بند کریں
View Order →|آرڈر دیکھیں
Order dekhein →|آرڈر دیکھیں
Table chunein ya Parcel karein|میز منتخب کریں یا پارسل کریں
Bill ke liye batayein: khana kis table par dena hai?|یہ کھانا کس میز پر دینا ہے؟
Is table ka bill banayein|اس میز کا بل بنائیں
Order pehle se chal raha hai|اس میز کا آرڈر پہلے سے موجود ہے
Parcel ka bill banayein|پارسل کا بل بنائیں
Customer name|گاہک کا نام
Pakistani mobile|موبائل نمبر
Pakistani mobile (optional)|موبائل نمبر، اگر ہو
Add customer|نیا گاہک
Note|تفصیل
Save|محفوظ کریں
Choose…|منتخب کریں
Apni dish ki photo lagayein (mobile / computer se)|کھانے کی تصویر اپنے موبائل یا کمپیوٹر سے لگائیں
Preparing image…|تصویر لگ رہی ہے…
WELCOME BACK|خوش آمدید
RESTAURANT OPERATIONS, SIMPLIFIED|اپنے ہوٹل کا آسان حساب
From first tap|کھانا چنیں
 to final bill.|اور بل بنائیں
Orders, a calm kitchen, and clear numbers for your whole team.|آرڈر، بل اور روز کا حساب ایک جگہ۔
Built for busy desi kitchens|دیسی ہوٹل کے لیے آسان نظام
Rawalpindi, Pakistan|راولپنڈی، پاکستان
Your staff account determines workspace access.|اپنا نام اور پاس ورڈ درج کریں۔
Username|صارف کا نام
Password|پاس ورڈ
Owner name|مالک کا نام
Installation setup token|ابتدائی اندراج کا کوڈ
Sign in|داخل ہوں
Initial Owner setup|مالک کا پہلا اندراج
Owner|مالک
Cashier|پیسے وصول کرنے والا
Kitchen|باورچی
Online|منسلک
Offline · Draft retained|رابطہ بند ہے، آرڈر محفوظ ہے
Rawalpindi|راولپنڈی
Sign out|باہر نکلیں
view|کا صفحہ
Connecting to restaurant workspace…|ہوٹل کا حساب کھل رہا ہے…
Retry connection|دوبارہ رابطہ کریں
Access restricted|اس صفحے کی اجازت نہیں ہے
Choose a permitted section from the navigation.|اپنے کام کا صفحہ منتخب کریں۔
Connection interrupted. Saved records may be stale; unsaved drafts are retained. Reconnecting…|رابطہ بند ہے۔ آپ کا آرڈر محفوظ ہے۔ دوبارہ رابطہ ہو رہا ہے۔
Kitchen board|باورچی خانے کے آرڈر
Rasoi ke orders|باورچی خانے کے آرڈر
Active orders|چلتے آرڈر
Chaltay orders|چلتے آرڈر
Tables|میزیں
Order history|پرانے آرڈر
Purane orders|پرانے آرڈر
Invoices|بل
Bills|بل
Held drafts|روکے ہوئے آرڈر
Rokay huay orders|روکے ہوئے آرڈر
New|نیا آرڈر
Preparing|تیار ہو رہا ہے
Ready|تیار ہے
Served|دے دیا گیا
Paid|پیسے مل گئے
Partial|کچھ پیسے ملے
Unpaid|پیسے باقی ہیں
Refunded|پیسے واپس کیے
Cancelled|منسوخ
open|جاری
closed|بند
cancelled|منسوخ
Start preparing|بنانا شروع کریں
Mark ready|کھانا تیار ہے
Mark served|کھانا دے دیا
Shared records · refreshed every 5 seconds|تازہ آرڈر یہاں نظر آتے ہیں
Invoice, table, customer phone…|بل، میز یا گاہک کا موبائل…
From date|اس تاریخ سے
To date|اس تاریخ تک
Print kitchen ticket|باورچی کی پرچی نکالیں
Open order|آرڈر کھولیں
items|کھانے
Resume draft|آرڈر دوبارہ کھولیں
Delete held draft|روکا ہوا آرڈر ہٹائیں
Invoice / Pay|بل دیکھیں، پیسے لیں
Add items|مزید کھانا شامل کریں
Release table / Close|میز خالی کریں
Cancel|منسوخ کریں
Confirm close|میز خالی کریں
Cancellation reason|منسوخی کی وجہ
Food preparation|کیا کھانا تیار ہوا؟
Not prepared (all tickets still New)|ابھی کھانا نہیں بنا
Prepared (ingredients retained; record wastage manually)|کھانا بن چکا ہے
Not prepared|نہیں بنا
Prepared|بن چکا ہے
Loading saved invoice|بل کھل رہا ہے
Waiting for shared records to reconnect...|رابطہ بحال ہونے کا انتظار ہے…
SAVED INVOICE|بل محفوظ ہو گیا
Revision|نسخہ
INVOICE|بل
DATE & TIME|تاریخ اور وقت
SERVICE|کھانے کا طریقہ
CUSTOMER|گاہک
PAYMENT|ادائیگی
ITEM / VARIANT|کھانا اور مقدار
QTY|تعداد
RATE|قیمت
AMOUNT|رقم
Subtotal|کھانوں کی رقم
Discount|رعایت
Tax|ٹیکس
Service charge|اضافی رقم
Grand total|کل رقم
Payments received|وصول شدہ رقم
Refunds|واپس کی گئی رقم
Net received|حاصل شدہ رقم
Outstanding|باقی رقم
Change returned|واپس کیے جانے والے پیسے
Payment / refund history|رقم کی آمد اور واپسی
NEXT STEP|اگلا کام
Receive payment now or later|اب پیسے وصول کریں
Invoice settled|پورے پیسے مل گئے
Receive Payment / Paisay lein|پیسے وصول کریں
Receipt format|بل کا کاغذ
80 mm thermal|چھوٹی پرچی
Saved revision for print / download|بل کا محفوظ نسخہ
WhatsApp sharing|واٹس ایپ پر بھیجیں
Download PDF|بل محفوظ کریں
Preparing PDF…|بل تیار ہو رہا ہے…
Print|پرنٹ کریں
Issue authorized refund|پیسے واپس کریں
Done|مکمل
← Back|واپس
Cash|نقد
Card|کارڈ
Bank/Wallet|بینک یا موبائل
Cash tendered (PKR)|گاہک نے کتنے روپے دیے؟
Amount received (PKR)|کتنے روپے ملے؟
Record payment|پیسے وصول کر لیں
Refundable|واپس کی جا سکنے والی رقم
Refund PKR|واپسی کی رقم
Refund method|پیسے کیسے واپس کیے؟
Reason|وجہ
Share|بل بھیجیں
Confirm recipient mobile|گاہک کا موبائل نمبر
Bill total|بل کی رقم
Share PDF through device|موبائل سے بل بھیجیں
2. Open WhatsApp with bill message|واٹس ایپ کھولیں
Apnay khanay / products|اپنے کھانے اور قیمتیں
Naam, photo, bechnay ka rate aur banane ki lagat dalein. Phir Naya Order mein select karein.|کھانے کا نام، تصویر، قیمت اور لاگت لکھیں۔ یہ کھانا نئے آرڈر میں نظر آئے گا۔
+ Apna khana add karein|نیا کھانا شامل کریں
Search dishes…|کھانے کا نام لکھیں…
Edit dish|کھانا تبدیل کریں
Add dish|نیا کھانا
Khanay / product ka naam|کھانے کا نام
Misal: Chicken Karahi|مثلاً چکن کڑاہی
Khanay ki category|کھانے کی قسم
Aaj yeh khana mil raha hai|یہ کھانا دستیاب ہے
Plate / Half / Full ka rate aur lagat|قیمت اور بنانے کی لاگت
Lagat mein gosht, masala, oil aur doosray ingredients ka kharcha dalein. Salary, rent, bijli alag Kharchay mein dalein.|لاگت میں گوشت، مصالحہ اور تیل کی قیمت شامل کریں۔ کرایہ، تنخواہ اور بجلی الگ خرچ میں لکھیں۔
Size / plate|کتنا کھانا؟
Half / Full / Plate / Piece|آدھی، پوری، پلیٹ یا عدد
Bechnay ka rate PKR|بیچنے کی قیمت، روپے
Banane ki lagat PKR|بنانے کی لاگت، روپے
Misal: 700|مثلاً 700
Wazan / stock ki mazeed setting|وزن اور دستیاب مقدار
Unit|اکائی
Quantity increment|ایک بار میں کتنی مقدار؟
Kitni tayyar hain? (khali = limit nahi)|کتنی تیار ہیں؟ خالی چھوڑیں تو کوئی حد نہیں
Yeh size hata dein|یہ مقدار ہٹائیں
+ Half / Full ya doosra size add karein|آدھی، پوری یا دوسری مقدار شامل کریں
Khana save karein|کھانا محفوظ کریں
Archive dish (history retained)|یہ کھانا فہرست سے ہٹائیں
Visits, purchase history and outstanding invoices|گاہک کے آرڈر اور باقی پیسے
Name or Pakistani mobile…|نام یا موبائل نمبر…
Customer|گاہک
Visits / Last visit|آخری بار کب آیا؟
Purchases|خریداری
Actions|کام
History / Collect|آرڈر دیکھیں، ادھار لیں
Edit|تبدیل کریں
Invoice / Collect|بل دیکھیں، رقم لیں
Ingredient name|سامان کا نام
Base unit|کس اکائی میں؟
Low stock threshold|کم ہونے پر کتنی مقدار باقی ہو؟
Ingredient|سامان
Movement type|سامان کا کام
Opening balance (once)|شروع کا موجود سامان
Stock in|سامان آیا
Manual consumption|سامان استعمال ہوا
Wastage|سامان ضائع ہوا
Adjustment (+/-)|مقدار درست کریں
Quantity in base unit|مقدار
Order / source reference (optional)|آرڈر نمبر، اگر ضرورت ہو
Reason / traceability|وجہ
Supplier name|سپلائر کا نام
Supplier|سپلائر
Amount PKR|رقم، روپے
Method|ادائیگی کا طریقہ
+ Ingredient|نیا سامان
Stock movement|سامان آیا یا استعمال ہوا
Receive purchase|خریداری درج کریں
+ Supplier|نیا سپلائر
Alert threshold|کم مقدار کی حد
Record movement|مقدار درج کریں
Edit threshold|حد تبدیل کریں
Pay existing balance|باقی پیسے ادا کریں
Edit supplier|سپلائر تبدیل کریں
Payments|ادائیگیاں
Amount paid now PKR|اب کتنے روپے دیے؟
Payment method|ادائیگی کا طریقہ
Purchase items|خریدا گیا سامان
Ingredient / base unit|سامان اور اکائی
Remove line|ہٹائیں
+ Add ingredient|مزید سامان شامل کریں
Kitna kamaya? Kitna kharch hua?|کتنا کمایا؟ کتنا خرچ ہوا؟
Aaj, is haftay aur is mahinay ka hisaab ek nazar mein|آج، اس ہفتے اور اس مہینے کا آسان حساب
+ Kharcha add karein|نیا خرچ لکھیں
Aaj|آج
Is haftay|اس ہفتے
Is mahinay|اس مہینے
From|اس تاریخ سے
To|اس تاریخ تک
Munafa|منافع
Nuqsan|نقصان
Lagat add karein, phir munafa nazar ayega|کھانوں کی لاگت لکھیں، پھر منافع نظر آئے گا
Khanay ki sale|کھانوں کی آمدن
Khanay ki lagat|کھانے بنانے کی لاگت
Collections / Wasool raqam|وصول کیے گئے پیسے
Gahakon ka udhaar|گاہکوں کا ادھار
Kharchay|خرچے
Wapas kiye paisay|واپس کیے گئے پیسے
Cash ka hisaab band karein|آج کا نقد حساب بند کریں
Cash ka hisaab shuru karein|نقد حساب شروع کریں
Sales by business date|روز کی آمدن
No sales in this period|اس مدت میں کوئی فروخت نہیں ہوئی
Popular dishes|زیادہ بکنے والے کھانے
units|عدد
Expenses|خرچے
Cash closing history|پچھلے نقد حساب
Expected|حساب کے مطابق رقم
Difference|فرق
Expense business date|خرچ کی تاریخ
Category|قسم
Note / reason|تفصیل یا وجہ
Current expected cash|حساب کے مطابق موجود نقد رقم
Restaurant name|ہوٹل کا نام
Tagline|مختصر تعارف
Address|پتہ
Contact phone|رابطہ نمبر
Business / tax identifier (optional)|ٹیکس نمبر، اگر ہو
Tax %|ٹیکس فیصد
Service charge %|اضافی رقم فیصد
Receipt thank-you footer|بل کے آخر کا پیغام
Default receipt|بل کی قسم
A4 invoice|بڑے کاغذ کا بل
+ Add table|نئی میز
Edit / deactivate|تبدیل یا بند کریں
+ Add staff|نیا ملازم
Edit access|اجازت تبدیل کریں
Date / actor|تاریخ اور نام
Action / reference|کام اور حوالہ
Details|تفصیل
Staff name|ملازم کا نام
Role|کام
Account state|کھاتے کی حالت
Active|چالو
Disabled|بند
Table name|میز کا نام
Table state|میز کی حالت'''
d={}
for line in pairs.splitlines():
 if '|' in line:
  k,v=line.split('|',1);d[k.strip()]=v
Path('urdu.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
Path('Urdu.ts').write_text('''import words from "./urdu.json"
const dictionary: Record<string,string> = words
export function urdu(value:any):any {
 if(Array.isArray(value)) return value.map(urdu)
 if(typeof value !== "string") return value
 const key=value.trim()
 if(dictionary[key]) return dictionary[key]
 if(/^Table \\d+$/.test(key)) return "میز " + key.split(" ")[1]
 if(/^PKR /.test(key)) return key.replace("PKR ","") + " روپے"
 if(key.startsWith("Neeche scroll")) return "نیچے مزید کھانے دیکھیں"
 if(key.startsWith("Choose variant")) return "مقدار چنیں — " + urdu(key.split(/[·?]/).pop()?.trim())
 if(key.startsWith("Add to order #")) return "آرڈر میں کھانا شامل کریں " + key.split("#")[1]
 if(key.includes("order lines ki lagat")) return "کچھ پرانے آرڈروں کی لاگت درج نہیں تھی۔ ان کا درست منافع معلوم نہیں۔ نئے کھانوں کی لاگت ضرور لکھیں۔"
 if(key.startsWith("Khanay ki sale −")) return "منافع = کھانوں کی آمدن − بنانے کی لاگت − خرچے"
 if(key.startsWith("Print ")) return "پرنٹ کریں " + key.slice(6)
 if(key.startsWith("Opening ")) return "شروع کی رقم: " + key.slice(8).replace("Expected","موجودہ رقم")
 return value
}
''',encoding='utf8')
