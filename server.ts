import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to initialize Gemini AI client:', e);
    }
  }
  return aiClient;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout exceeded')), timeoutMs)
    )
  ]);
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// 2. AI Caption & Hashtag Generation Endpoint
app.post('/api/integrations/ai/caption', async (req, res) => {
  try {
    const { title, subtitle, category, theme, tone = 'minimal', language = 'ar' } = req.body;

    const toneDescriptions: Record<string, string> = {
      minimal: 'Swiss Minimalist: direct, authoritative, sharp, elegant, minimal words',
      engaging: 'Engaging & Hook-driven: starts with an attention grabber, relatable question, invites discussion',
      educational: 'Educational Breakdown: bullet points with practical design rules and key takeaways',
      conversion: 'High-Conversion: strong call-to-action, saving for later, clicking link in bio'
    };

    const selectedTone = toneDescriptions[tone] || toneDescriptions.minimal;

    // Check if Gemini is available
    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `You are an elite editorial art director and social media strategist for ContentForge.
Write an Instagram/LinkedIn post caption and hashtags for this design piece:
- Title: "${title}"
- Subtitle: "${subtitle}"
- Category: "${category}"
- Theme: "${theme}"
- Target Tone: ${selectedTone}
- Output Language: ${language === 'ar' ? 'Modern Arabic (اللغة العربية المعاصرة والأنيقة)' : 'English'}

Provide the response strictly in this JSON format:
{
  "caption": "The complete formatted caption with spacing and line breaks",
  "hook": "Single line punchy headline opener",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }),
          4000
        );

        const responseText = response.text || '';
        try {
          const parsed = JSON.parse(responseText);
          return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
        } catch {
          // In case json parsing failed, return text as caption
          return res.json({
            success: true,
            source: 'gemini-3.8-flash-raw',
            data: {
              caption: responseText,
              hook: title,
              hashtags: ['#GraphicDesign', '#Typography', '#DesignSystem', '#ContentForge']
            }
          });
        }
      } catch (aiErr) {
        console.warn('Gemini API temporary issue, falling back to deterministic editorial generator:', aiErr);
      }
    }

    // Fallback: Smart deterministic high-quality editorial generator
    let hook = title;
    let captionText = '';
    let hashtags = ['#GraphicDesign', '#SwissDesign', '#Typography', '#DesignSystems', '#ContentForge'];

    if (language === 'ar') {
      if (tone === 'minimal') {
        hook = `«${title}» — دقة بصرية لا تقبل المساومة.`;
        captionText = `${hook}\n\n${subtitle}\n\nالتصميم ليس مجرد إضافة عناصر، بل هو إدراك واعٍ لقوة المساحات البيضاء وتناغم التايبوجرافي السويسري الصارم.\n\nما رأيك في هذه القاعدة في مشاريعك؟`;
      } else if (tone === 'educational') {
        hook = `3 قواعد ذهبية مستخلصة من: ${title}`;
        captionText = `${hook}\n\n1️⃣ التركيز البصري: نقطة ارتكاز واحدة تقود عين المشاهد دون تشتت.\n2️⃣ الانضباط الطباعي: الاكتفاء بعائلتين خطيتين كحد أقصى لإبراز الهوية.\n3️⃣ التباين المدروس: النسبة الذهبية بين الكتل والنصوص لتحقيق أعلى وضوح.\n\nاحفظ المنشور للرجوع إليه عند تصميم مشروعك القادم. 📌`;
      } else if (tone === 'conversion') {
        hook = `هل تطبق هذه القاعدة في تصميماتك اليوم؟ ⚡`;
        captionText = `${hook}\n\n${title} — ${subtitle}\n\nارتقِ بجودة إنتاجك البصري وطبّق أنظمة التصميم الحديثة بأسلوب سويسري متقن.\n\n👉 احفظ المنشور الآن وشاركه مع فريقك المهتم بالفنون الرقمية.`;
      } else {
        hook = `المعادلة التي تغيّر طريقة رؤيتك للتصميم:`;
        captionText = `${hook}\n\n"${title}"\n${subtitle}\n\nعندما تدمج بين الهندسة الدقيقة والذوق الفني المتزن، يتحول أي ملصق من مجرد منشور عابر إلى عمل بصري خالد.\n\nشاركنا تقييمك لهذا الأسلوب في التعليقات! 👇`;
      }
      hashtags = ['#تصميم_جرافيك', '#تايبوجرافي', '#فن_الملصقات', '#هوية_بصرية', '#ContentForge'];
    } else {
      if (tone === 'minimal') {
        hook = `"${title}" — Architectural Precision.`;
        captionText = `${hook}\n\n${subtitle}\n\nDesign is not visual decoration; it is intentional spatial balance and typographic discipline.\n\nEngineered with Swiss rigor.`;
      } else if (tone === 'educational') {
        hook = `Core Principle: ${title}`;
        captionText = `${hook}\n\n• Primary Anchor: Guide viewer velocity through deliberate contrast.\n• Font Pairing: Limit families to preserve structural hierarchy.\n• Whitespace: Treat negative space as an active compositional tool.\n\nSave this framework for your next editorial layout.`;
      } else {
        hook = `Redefining Visual Hierarchy: ${title}`;
        captionText = `${hook}\n\n${subtitle}\n\nBalancing geometry with brutalist typographic scale. When structure dictates form, the message resonates clearly.\n\nWhat are your thoughts on this approach? Drop a comment below.`;
      }
    }

    return res.json({
      success: true,
      source: 'offline-editorial-engine',
      data: {
        hook,
        caption: captionText,
        hashtags
      }
    });
  } catch (error: any) {
    console.error('Error generating caption:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate caption' });
  }
});

// 2.5 AI Performance & Editorial Audit Endpoint
app.post('/api/analytics/ai/audit', async (req, res) => {
  try {
    const { projectSummary, recentRecords = [] } = req.body;
    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `You are an elite Creative Director and Growth Strategist for ContentForge (Swiss Design & Editorial Publishing System).
Analyze the following project metrics and publishing patterns:
- Project: "${projectSummary?.name || 'ContentForge'}"
- Total Content Records: ${projectSummary?.totalRecords || 0}
- Published Records: ${projectSummary?.publishedRecords || 0}
- Ready/Draft Records: ${projectSummary?.readyRecords || 0}
- Publishing Streak: ${projectSummary?.streakDays || 0} days
- Brand Compliance Score: ${projectSummary?.complianceScore || 92}%
- Content Formats: ${JSON.stringify(projectSummary?.formats || {})}
- Sample Recent Topics: ${JSON.stringify(recentRecords.slice(0, 8).map((r: any) => r.title))}

Provide an editorial strategy evaluation strictly in this JSON format:
{
  "overallHealth": "ممتاز (Optimized)" | "جيد ومستقر (Stable)" | "بحاجة لتعزيز الوتيرة (Action Needed)",
  "strategicScore": 94,
  "topStrength": "أبرز نقطة قوة في الاستراتيجية الحالية باللغة العربية",
  "criticalGap": "الفجوة التحريرية أو المنصات الناقصة الواجب تغطيتها باللغة العربية",
  "recommendations": [
    {
      "title": "عنوان التوصية الأولى",
      "action": "الإجراء العملي المحدد للبدء فوراً",
      "impact": "High"
    },
    {
      "title": "عنوان التوصية الثانية",
      "action": "الإجراء العملي المحدد",
      "impact": "Medium"
    },
    {
      "title": "عنوان التوصية الثالثة",
      "action": "الإجراء العملي المحدد",
      "impact": "High"
    }
  ],
  "highValueTopics": [
    "موضوع مقترح 1 ذو قابلية انتشار عالية",
    "موضوع مقترح 2 ذو قابلية انتشار عالية",
    "موضوع مقترح 3 ذو قابلية انتشار عالية"
  ],
  "bestPostingCadence": "التوقيت المقترح وجدول النشر الموصى به"
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }),
          4000
        );

        const responseText = response.text || '';
        try {
          const parsed = JSON.parse(responseText);
          return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
        } catch {
          // Fallback to text if JSON parsing fails
        }
      } catch (aiErr) {
        console.warn('Gemini API temporary issue in audit, falling back to deterministic engine:', aiErr);
      }
    }

    // High-quality deterministic fallback
    const publishedRatio = projectSummary?.totalRecords > 0 
      ? Math.round((projectSummary.publishedRecords / projectSummary.totalRecords) * 100) 
      : 50;

    return res.json({
      success: true,
      source: 'offline-editorial-engine',
      data: {
        overallHealth: publishedRatio > 60 ? 'ممتاز (Optimized)' : 'جيد ومستقر (Stable)',
        strategicScore: Math.min(98, Math.max(78, 80 + (projectSummary?.streakDays || 1) * 2)),
        topStrength: 'انضباط بصري عالي وتنوع متزن في عناوين المنشورات مع ترسيخ مبادئ التايبوجرافي السويسري الصارم.',
        criticalGap: 'الحاجة إلى تحويل البوسترات الفردية إلى سلاسل كاروسيل ومقاطع فيديو رأسية (TikTok/Reels 9:16) لزيادة معدل الحفظ.',
        recommendations: [
          {
            title: 'تكثيف إنتاج المقاطع الرأسية 9:16',
            action: 'اعتماد قالب TikTok-9:16 للمنشورات التوضيحية السريعة مع التركيز على العنوان الفرعي الصادم.',
            impact: 'High'
          },
          {
            title: 'تطبيق اختبار المتغيرات (A/B Variations)',
            action: 'تفعيل المتغيرين (Var A و Var B) لكل بوستر لمقارنة أداء العناوين العريضة مقابل العناوين المقتضبة.',
            impact: 'Medium'
          },
          {
            title: 'جدولة محتوى المساء في أوقات الذروة',
            action: 'نشر المنشورات بين الساعة 5:00 و 8:00 مساءً بالتوقيت المحلي لزيادة معدلات التفاعل الأولي.',
            impact: 'High'
          }
        ],
        highValueTopics: [
          'قواعد التباين الست في المدرسة السويسرية الحديثة',
          'لماذا يبدو حسابك مشتتاً؟ حل مشكلة الخطوط المتعددة في 3 دقائق',
          'تشريح بوستر إعلاني ناجح: مساحات التنفس وسرعة عين القارئ'
        ],
        bestPostingCadence: 'أيام الأحد والثلاثاء والخميس، بمعدل منشور رئيسي واحد يومياً + 3 قصص داعمة.'
      }
    });
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate audit' });
  }
});

// 2.6 AI Content Repurposing Engine Endpoint
app.post('/api/content/ai/repurpose', async (req, res) => {
  try {
    const { title, subtitle, caption, targetFormat = 'twitter_thread', language = 'ar' } = req.body;
    const ai = getAIClient();

    if (ai) {
      try {
        const prompt = `You are an elite multi-platform content repurposing strategist for a Swiss Design studio called ContentForge.
Convert this piece of content into a high-performing ${targetFormat}:
- Title: "${title}"
- Subtitle: "${subtitle}"
- Original Caption/Notes: "${caption}"
- Target Output: ${targetFormat} (options: twitter_thread, tiktok_script, carousel_slides)
- Language: ${language === 'ar' ? 'Modern Arabic (اللغة العربية المعاصرة والأنيقة)' : 'English'}

Respond strictly in this JSON format:
{
  "targetFormat": "${targetFormat}",
  "headline": "Punchy hook or title",
  "content": "The full formatted content text ready to copy-paste with emojis and spacing",
  "sections": ["Part 1 / Slide 1 / Tweet 1", "Part 2 / Slide 2 / Tweet 2", "Part 3 / Slide 3 / Tweet 3", "Part 4 / Slide 4 / Tweet 4", "Part 5 / Slide 5 / Tweet 5"],
  "callToAction": "Clear closing CTA"
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }),
          4000
        );

        const responseText = response.text || '';
        try {
          const parsed = JSON.parse(responseText);
          return res.json({ success: true, source: 'gemini-3.8-flash', data: parsed });
        } catch {
          // fallback to deterministic
        }
      } catch (aiErr) {
        console.warn('Gemini API temporary issue in repurpose, falling back to deterministic engine:', aiErr);
      }
    }

    // High quality deterministic repurposing fallback
    let headline = title;
    let sections: string[] = [];
    let content = '';
    let callToAction = 'احفظ هذا المنشور وشاركه مع المصممين والمهتمين بالتايبوجرافي.';

    if (targetFormat === 'twitter_thread') {
      headline = `🧵 ثريد: كيف تطبق قواعد التايبوجرافي السويسري في "${title}"؟`;
      sections = [
        `1/5 📐 البداية من الشبكة (Grid System): التايبوجرافي ليس مجرد خطوط جميلة، بل هندسة صارمة تقود عين القارئ.`,
        `2/5 ⚡ التباين البصري (Contrast): اجعل العنوان عريضاً وحاسماً، والمساحات السلبية تتنفس حوله بدون زحام.`,
        `3/5 🔤 اختزال العائلات: لا تخلط أكثر من خطين في التصميم الواحد. البساطة هي قمة التعقيد المتقن.`,
        `4/5 🎯 التوجيه البصري: استخدم العناصر الهندسية والأختام الدقيقة لترسيخ الهوية بدون تشويش.`,
        `5/5 🏁 الخلاصة: إذا كان المحتوى مهماً، يجب أن يكون تصميمه محترماً لعقل ووقت المشاهد.`
      ];
      content = `${headline}\n\n${sections.join('\n\n')}\n\n${callToAction}`;
    } else if (targetFormat === 'tiktok_script') {
      headline = `[فيديو 45 ثانية] سر تصميم "${title}" الذي يتجاهله 90% من المصممين`;
      sections = [
        `[00:00 - 00:05] الخطاف (Hook): هل لاحظت ليش بعض البوسترات تشدك فوراً والبعض تتجاوزه بثانية؟ السر هنا.`,
        `[00:05 - 00:15] المشكلة: أغلب الحسابات تستخدم 4 خطوط في بوست واحد وتنسى مساحات التنفس.`,
        `[00:15 - 00:30] الحل السويسري: استخدم خطين فقط، اجعل العنوان 60pt وأعطِ خلفية رمادية أو فحمية نظيفة.`,
        `[00:30 - 00:45] الخاتمة وCTA: طبق هالقاعدة اليوم وشوف الفرق. تابعنا لمزيد من أسرار التصميم اليومية!`
      ];
      content = `${headline}\n\n${sections.join('\n\n')}`;
    } else {
      headline = `كاروسيل (5 شرائح): دليل "${title}" العملي`;
      sections = [
        `شريحة 1 (الغلاف): ${title} // الدليل الإرشادي المبسط.`,
        `شريحة 2: المبدأ الأول - التباين الصارم والمقاييس المدروسة.`,
        `شريحة 3: المبدأ الثاني - حذف كل عنصر لا يخدم الرسالة.`,
        `شريحة 4: تطبيق عملي - مقارنة قبل وبعد مع هوية ContentForge.`,
        `شريحة 5 (الختام): مرجعك السريع للتصميم القادم + احفظ للمستقبل.`
      ];
      content = `${headline}\n\n${sections.join('\n\n')}\n\n${callToAction}`;
    }

    return res.json({
      success: true,
      source: 'offline-editorial-engine',
      data: {
        targetFormat,
        headline,
        content,
        sections,
        callToAction
      }
    });
  } catch (error: any) {
    console.error('Error generating repurpose:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate repurpose' });
  }
});

// 3. Webhook Dispatch Endpoint
app.post('/api/integrations/webhook/dispatch', async (req, res) => {
  const { url, payload, headers = {} } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Webhook URL is required' });
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ContentForge-Webhook-Dispatcher/2.0',
        ...headers
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const latency = Date.now() - startTime;
    const responseText = await response.text();

    res.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      latencyMs: latency,
      body: responseText.slice(0, 500)
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    res.json({
      success: false,
      status: 0,
      statusText: error?.name === 'AbortError' ? 'Timeout (8s limit exceeded)' : error?.message || 'Network error',
      latencyMs: latency,
      body: null
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ContentForge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
