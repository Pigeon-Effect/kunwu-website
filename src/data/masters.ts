/**
 * The masters – drives the home page cards and the /master page.
 *
 * Chinese texts are the school's own wording, verbatim. English texts as supplied.
 * Card fields (title, lineage, credentials) are condensed from the biographies – no new facts.
 *
 * Inline markup in texts:
 *   [^id]  footnote reference → `footnotes[id]` is listed under the biography
 * On English pages, runs of Chinese characters are tagged lang="zh-Hans" automatically.
 */
import { photos, type PhotoId } from './photos';

type L<T> = { en: T; zh: T };

export type BioBlock =
  | { type: 'p'; text: string }
  /** "拳械擅长：" + text – the term is set off, the wording stays intact */
  | { type: 'term'; term: string; text: string }
  /** a list; `marks: 'check'` replaces the ✅ of the source with a small vermilion mark */
  | { type: 'list'; items: string[]; marks?: 'check' };

export type BioSectionKey = 'about' | 'specialties' | 'teachers' | 'honours' | 'teaching';

export interface BioSection {
  key: BioSectionKey;
  blocks: BioBlock[];
}

export interface Master {
  slug: string;
  /** false = kept in the data, not shown anywhere on the site */
  visible: boolean;
  /** one hanzi for the seal */
  seal: string;
  name: L<string>;
  /** 释延淞 */
  hanzi: string;
  name_pinyin: string;
  layman_name: L<string>;
  /** role line under the name */
  title: L<string>;
  lineage: L<string>;
  /** 3–4 short lines for the card and the head of the bio */
  credentials: L<string[]>;
  bio: L<BioSection[]>;
  footnotes?: L<Record<string, string>>;
  /** portrait; null renders a seal + name placeholder */
  image: PhotoId | null;
  /** CSS object-position for the portrait crop */
  imagePosition?: string;
  /** further photos on the /master page */
  photos?: PhotoId[];
}

export const masters: Master[] = [
  {
    slug: 'shi-yansong',
    visible: true,
    seal: '淞',
    name: { en: 'Shi Yansong', zh: '释延淞' },
    hanzi: '释延淞',
    name_pinyin: 'Shì Yánsōng',
    layman_name: { en: 'Wu Song', zh: '吴淞' },
    title: {
      en: 'Core instructor · traditional Wushu and martial medicine',
      zh: '核心师资 · 传统武术与武医养生',
    },
    lineage: {
      en: '18th-generation successor of Meihua Quan · Lay disciple of the Shaolin Temple',
      zh: '梅花拳第十八世传人 · 少林寺俗家弟子',
    },
    credentials: {
      en: [
        '18th-generation successor of Meihua Quan (Plum Blossom Fist)',
        'Lay disciple of the Shaolin Temple',
        'Member of the Chinese Wushu Association',
        'National traditional Wushu champion; Cross-Strait Wushu champion',
      ],
      zh: ['梅花拳第十八世传人', '少林寺俗家弟子', '中国武术协会会员', '全国传统武术冠军、海峡两岸武术冠军'],
    },
    bio: {
      zh: [
        {
          key: 'about',
          blocks: [
            { type: 'p', text: '释延淞，俗名吴淞，出身武医世家，梅花拳第十八世传人、少林寺俗家弟子，中国武术协会会员。' },
            { type: 'p', text: '先后斩获全国传统武术冠军、海峡两岸武术冠军，武学功底扎实，深耕传统武术传承与教学。' },
          ],
        },
        {
          key: 'specialties',
          blocks: [
            {
              type: 'term',
              term: '拳械擅长：',
              text: '少林拳、梅花拳、螳螂拳、八极拳、少林棍法、春秋大刀、朴刀、梅花刀、双手剑等传统套路；',
            },
            {
              type: 'term',
              term: '武医方向：',
              text: '精研中医学，传承少林八段锦、传统养生功法，秉持武医同源、文武同修理念。',
            },
          ],
        },
        {
          key: 'teaching',
          blocks: [
            {
              type: 'p',
              text: '在教学上，注重武德为先，兼顾功夫实训、体质调养与传统文化传播，面向青少年武术培训、成人传统武术研学、养生功法研修、外籍武术研学交流等核心师资。',
            },
          ],
        },
      ],
      en: [
        {
          key: 'about',
          blocks: [
            {
              type: 'p',
              text: "Shi Yansong (layman's name Wu Song) comes from a family of martial artists and physicians. He is an 18th-generation successor of Meihua Quan (Plum Blossom Fist), a lay disciple of the Shaolin Temple and a member of the Chinese Wushu Association.",
            },
            {
              type: 'p',
              text: 'He has won the national traditional Wushu championship and the Cross-Strait Wushu championship. With a solid martial foundation, he is devoted to passing on and teaching traditional Wushu.',
            },
          ],
        },
        {
          key: 'specialties',
          blocks: [
            {
              type: 'term',
              term: 'Hand and weapon forms:',
              text: 'Shaolin Quan, Meihua Quan, Praying Mantis, Baji Quan, Shaolin staff, Chunqiu Dadao (Spring and Autumn broadsword), Pudao, Meihua Dao, double-handed sword and other traditional forms.',
            },
            {
              type: 'term',
              term: 'Martial medicine:',
              text: 'He has studied Traditional Chinese Medicine in depth and teaches Shaolin Baduanjin and traditional health-cultivation practices, following the principles that martial arts and medicine share one source and that the civil and the martial are cultivated together.',
            },
          ],
        },
        {
          key: 'teaching',
          blocks: [
            {
              type: 'p',
              text: 'In teaching he puts martial virtue (wude) first, combining hands-on kung fu training, physical conditioning and the transmission of traditional culture. He is a core instructor for youth martial arts training, traditional martial arts study for adults, health-practice courses and exchange programs for international students.',
            },
          ],
        },
      ],
    },
    image: 'yansongSwordBamboo',
    imagePosition: '44% 30%',
    photos: ['yansongBlueRobe', 'yansongGuandaoHall'],
  },
  {
    slug: 'shi-yantao',
    visible: true,
    seal: '涛',
    name: { en: 'Shi Yantao', zh: '释延涛' },
    hanzi: '释延涛',
    name_pinyin: 'Shì Yántāo',
    layman_name: { en: 'Wu Tao', zh: '吴涛' },
    title: {
      en: 'Traditional Wushu · martial study · martial-medicine health practice',
      zh: '传武教学 · 武术研学 · 武医养生',
    },
    lineage: {
      en: '17th-generation successor of Meihua Quan · 34th-generation lay disciple of the Shaolin Temple',
      zh: '梅花拳第十七世传人 · 少林寺三十四代俗家弟子',
    },
    credentials: {
      en: [
        '17th-generation successor of Meihua Quan (Plum Blossom Fist)',
        '34th-generation lay disciple of the Shaolin Temple',
        '5th Duan in Chinese Wushu; Wushu Bingdao referee and coach',
        'National Sanda champion; national traditional Wushu champion',
      ],
      zh: ['梅花拳第十七世传人', '少林寺三十四代俗家弟子', '中国武术五段，中国武术兵道裁判员、教练员', '全国散打冠军、全国传统武术冠军'],
    },
    bio: {
      zh: [
        {
          key: 'about',
          blocks: [
            { type: 'p', text: '释延涛（俗名：吴涛），出身武医世家，梅花拳第十七世传人，少林寺三十四代俗家弟子。' },
            {
              type: 'p',
              text: '现为中国武术协会会员、中国武术五段、中国武术兵道裁判员、中国武术兵道教练员，全国散打冠军、全国传统武术冠军。',
            },
          ],
        },
        {
          // source line "师承：" becomes the section heading
          key: 'teachers',
          blocks: [
            {
              type: 'list',
              items: [
                '恩师陆建民先生，原中国援助埃及国家散打队总教练；',
                '传武师从马中轩先生，武英级运动员、全国武术全能冠军、中国武术散打王争霸赛总策划、国际动作导演；',
                '并跟随中国武术八段、高级教练刘宝印师爷（国际武术联合会秘书长张玉萍恩师）修习传统武术，精通梅花拳、春秋大刀、梅花刀、螳螂拳、三节棍等传统套路。',
              ],
            },
          ],
        },
        {
          key: 'honours',
          blocks: [
            { type: 'p', text: '2015—2017年，代表国家级非物质文化遗产梅花拳总会参赛，斩获多项国内外赛事荣誉：' },
            {
              type: 'list',
              marks: 'check',
              items: ['河北沧州国际武术节冠军', '山东烟台国际武术节冠军', '上海全国国家非遗武术展演大会冠军', '贵州福泉山国际武林大会冠军'],
            },
          ],
        },
        {
          key: 'teaching',
          blocks: [{ type: 'p', text: '深耕传武教学、武术研学与武医养生方向，致力于传承梅花拳非遗文化，推广中华武术。' }],
        },
      ],
      en: [
        {
          key: 'about',
          blocks: [
            {
              type: 'p',
              text: "Shi Yantao (layman's name Wu Tao) comes from a family of martial artists and physicians. He is a 17th-generation successor of Meihua Quan and a 34th-generation lay disciple of the Shaolin Temple.",
            },
            {
              type: 'p',
              text: 'He is a member of the Chinese Wushu Association, holds 5th Duan in Chinese Wushu, and is a Wushu Bingdao (兵道)[^bingdao] referee and coach, national Sanda champion and national traditional Wushu champion.',
            },
          ],
        },
        {
          key: 'teachers',
          blocks: [
            {
              type: 'list',
              items: [
                "His mentor Lu Jianmin, former head coach of the Chinese Sanda team sent to Egypt under China's foreign aid program.",
                'In traditional martial arts he studied under Ma Zhongxuan: Wuying-class athlete, national all-round Wushu champion, chief planner of the "China Sanda King" competition and international action director.',
                'He also trained with Liu Baoyin, 8th Duan in Chinese Wushu and senior coach (teacher of Zhang Yuping, Secretary General of the International Wushu Federation). He is proficient in Meihua Quan, Chunqiu Dadao, Meihua Dao, Praying Mantis, three-section staff and other traditional forms.',
              ],
            },
          ],
        },
        {
          key: 'honours',
          blocks: [
            {
              type: 'p',
              text: 'From 2015 to 2017 he competed for the General Association of Meihua Quan, a national intangible cultural heritage, and won numerous domestic and international titles:',
            },
            {
              type: 'list',
              marks: 'check',
              items: [
                'Champion, Cangzhou International Wushu Festival, Hebei',
                'Champion, Yantai International Wushu Festival, Shandong',
                'Champion, National Intangible Heritage Wushu Showcase, Shanghai',
                'Champion, Fuquan Mountain International Wulin Conference, Guizhou',
              ],
            },
          ],
        },
        {
          key: 'teaching',
          blocks: [
            {
              type: 'p',
              text: 'He is dedicated to teaching traditional martial arts, martial study programs and martial-medicine health practice, preserving the Meihua Quan heritage and promoting Chinese martial arts.',
            },
          ],
        },
      ],
    },
    footnotes: {
      en: {
        bingdao:
          'Bingdao (兵道): a Chinese Wushu discipline. [PLACEHOLDER: one-sentence explanation of Bingdao – to be confirmed by the school]',
      },
      zh: {},
    },
    image: 'yantaoSideKick',
    imagePosition: '62% 50%',
    photos: ['yantaoGuandaoTemple'],
  },

  /**
   * Hidden on purpose (Nov 2026): content moved here unchanged from src/content/master/{en,zh}.md.
   * Set visible: true to show him again on the home page and /master.
   */
  {
    slug: 'shi-yanpeng',
    visible: false,
    seal: '朋',
    name: { en: 'Shi Yanpeng', zh: '释延朋' },
    hanzi: '释延朋',
    name_pinyin: 'Shì Yánpéng',
    layman_name: { en: '', zh: '' },
    title: { en: 'Master Shi Yanpeng', zh: '释延朋师傅' },
    lineage: { en: '34th-generation lay disciple of the Shaolin Temple', zh: '少林寺第三十四代俗家弟子' },
    credentials: {
      en: [
        '34th-generation lay disciple of the Shaolin Temple on Mount Song',
        'First-class coaching certificate in Wing Chun, Chinese Wushu Association',
        'First-class coaching certificate in Wushu, Chinese Wushu Association',
        '6th Duan, awarded by the Shaolin Wushu Association and its Expert Committee',
        'Has performed in and choreographed several kung fu films',
      ],
      zh: [
        '嵩山少林寺第三十四代俗家弟子',
        '中国武术协会咏春拳一级教练证书',
        '中国武术协会武术一级教练证书',
        '少林武术协会、少林武术专家委员会授予六段段位',
        '参演并指导多部功夫影片',
      ],
    },
    bio: {
      en: [
        {
          key: 'about',
          blocks: [
            {
              type: 'p',
              text: 'Master Shi Yanpeng is a 34th-generation lay disciple of the Shaolin Temple on Mount Song, China. He has devoted his life to preserving and passing on the substance and the precepts of authentic Shaolin martial arts.',
            },
            {
              type: 'p',
              text: 'He holds first-class coaching certificates in Wing Chun and Wushu from the Chinese Wushu Association, and has been awarded the 6th Duan rank by the Shaolin Wushu Association and its Expert Committee — a rare level of qualification among martial artists.',
            },
            {
              type: 'p',
              text: 'Beyond teaching, he has performed in and choreographed several kung fu films, bringing genuine Shaolin technique to the screen and the spirit of Chinese kung fu to a wider audience.',
            },
          ],
        },
        {
          key: 'teaching',
          blocks: [
            {
              type: 'p',
              text: 'In every class he demands precise technique, but his deeper focus is on cultivating inner strength, martial virtue (武德) and the unity of body and mind. Patient, clear and focused, he leads his students into a living tradition.',
            },
            {
              type: 'p',
              text: 'His aim is simple: to pass on authentic Shaolin and traditional Chinese kung fu to every student who comes with sincerity and determination.',
            },
          ],
        },
      ],
      zh: [
        {
          key: 'about',
          blocks: [
            { type: 'p', text: '释延朋师傅是中国嵩山少林寺第三十四代俗家弟子，毕生致力于传承与弘扬正统少林武术的内涵与戒规。' },
            {
              type: 'p',
              text: '他持有中国武术协会颁发的咏春拳与武术一级教练证书，并获少林武术协会、少林武术专家委员会授予六段段位，在武术修习者当中属于难得的资历。',
            },
            {
              type: 'p',
              text: '除教学之外，延朋师傅还曾参演并指导多部功夫影片，将原汁原味的少林功夫与技法搬上银幕，向更广的大众传递中国功夫的精神。',
            },
          ],
        },
        {
          key: 'teaching',
          blocks: [
            {
              type: 'p',
              text: '每一堂课上，他不光讲究招式的精准，更着重引导学员修内力、立武德，追求身心合一。他耐心、通透、专注，带领学员走入鲜活的传统功夫传承。',
            },
            { type: 'p', text: '他的初心质朴而厚重：把正宗的少林功夫与中国传统功夫传给每一位心怀诚意、意志坚定的求学者。' },
          ],
        },
      ],
    },
    image: 'yanpengEarlyYears',
  },
];

export const visibleMasters = masters.filter((m) => m.visible);

export const masterPhoto = (id: PhotoId | null | undefined) => (id ? photos[id] : null);
