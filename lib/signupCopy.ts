// Every visitor-facing string on /sign-up-collab (picker + form), in the three
// languages the Antalya ads run in. Written by hand, informal register ("sen" /
// "ты"), so it reads like the ads rather than like a translated form.
import type { Lang } from './locale'
import { SHOOT } from './shoot'

export type SignupCopy = {
  languageName: string
  dates: string
  // The hook is the city, then the offer: "İstanbul · ücretsiz fotoğraf çekimi",
  // the same pairing the ads' first slide uses, so the page matches the ad.
  city: string
  headline: string
  note: { lead: string; rest: string }
  skip: string
  back: string
  startOver: string
  chooseRound: (round: number) => string
  chooseImage: (alt: string) => string
  status: (round: number, saved: number, max: number) => string
  choosePhotos: string
  signUpTitle: string
  signUpNote: string
  doneTitle: string
  doneNote: string
  whereToMessage: string
  whatsapp: string
  instagram: string
  whatsappLabel: string
  instagramLabel: string
  instagramPlaceholder: string
  followHint: { before: string; after: string }
  whereAreYou: string
  whereAreYouPlaceholder: string
  notes: string
  optional: string
  photosOfYou: string
  upTo3: string
  yourPhoto: (n: number) => string
  removePhoto: (n: number) => string
  addingPhotos: string
  signingUp: string
  signUp: string
  errors: {
    photoFailed: string
    picksLost: string
    whatsapp: string
    instagram: string
    noLocation: string
    noPhoto: string
    saveFailed: string
  }
}

export const SIGNUP_COPY: Record<Lang, SignupCopy> = {
  en: {
    languageName: 'English',
    dates: SHOOT.dates,
    city: SHOOT.city,
    headline: 'free photo shoot',
    note: { lead: 'Choose your preferred photo vibe.', rest: ' Then we’ll plan a shoot around it.' },
    skip: 'Skip',
    back: '← Back',
    startOver: 'Start over',
    chooseRound: round => `Choose one photo, round ${round}`,
    chooseImage: alt => `Choose ${alt}`,
    status: (round, saved, max) => `Round ${round}. ${saved} of ${max} photos saved.`,
    choosePhotos: 'Choose your photos',
    signUpTitle: 'Now sign up.',
    signUpNote: 'Your picks are saved. Fill this in and I’ll message you.',
    doneTitle: 'Got it.',
    doneNote: 'I’ll message you to plan the shoot.',
    whereToMessage: 'Where should I message you?',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    whatsappLabel: 'WhatsApp number',
    instagramLabel: 'Instagram username',
    instagramPlaceholder: '@yourusername',
    followHint: { before: 'Please follow ', after: ' or I won’t be able to message you.' },
    whereAreYou: 'Where are you?',
    whereAreYouPlaceholder: 'Kadıköy, Beşiktaş, Beyoğlu, Üsküdar…',
    notes: 'Notes',
    optional: 'optional',
    photosOfYou: 'Photos of you',
    upTo3: 'up to 3',
    yourPhoto: n => `Your photo ${n}`,
    removePhoto: n => `Remove your photo ${n}`,
    addingPhotos: 'Adding your photos…',
    signingUp: 'Signing up…',
    signUp: 'Sign up',
    errors: {
      photoFailed: 'Could not add that photo. Please try again.',
      picksLost: 'Your picks didn’t come through. Go back and choose again.',
      whatsapp: `Enter your WhatsApp number with its country code, for example ${SHOOT.phoneExample}.`,
      instagram: 'Enter your Instagram username, without a link.',
      noLocation: 'Tell me where you are.',
      noPhoto: 'Add at least one photo of you.',
      saveFailed: 'Your signup didn’t save. Your picks are still here — please try again.',
    },
  },
  tr: {
    languageName: 'Turkish',
    dates: 'Eylül',
    city: 'İstanbul',
    headline: 'ücretsiz fotoğraf çekimi',
    note: { lead: 'Sevdiğin fotoğraf tarzını seç.', rest: ' Sonra çekimi buna göre planlarız.' },
    skip: 'Atla',
    back: '← Geri',
    startOver: 'Baştan başla',
    chooseRound: round => `Bir fotoğraf seç, ${round}. tur`,
    chooseImage: alt => `Seç: ${alt}`,
    status: (round, saved, max) => `${round}. tur. ${max} fotoğraftan ${saved} tanesi kaydedildi.`,
    choosePhotos: 'Fotoğraflarını seç',
    signUpTitle: 'Şimdi kaydol.',
    signUpNote: 'Seçimlerin kaydedildi. Bunu doldur, sana yazayım.',
    doneTitle: 'Tamamdır.',
    doneNote: 'Çekimi planlamak için sana yazacağım.',
    whereToMessage: 'Sana nereden yazayım?',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    whatsappLabel: 'WhatsApp numarası',
    instagramLabel: 'Instagram kullanıcı adı',
    instagramPlaceholder: '@kullaniciadin',
    followHint: { before: 'Lütfen ', after: ' hesabını takip et, yoksa sana mesaj atamam.' },
    whereAreYou: 'Neredesin?',
    whereAreYouPlaceholder: 'Kadıköy, Beşiktaş, Beyoğlu, Üsküdar…',
    notes: 'Notlar',
    optional: 'isteğe bağlı',
    photosOfYou: 'Senin fotoğrafların',
    upTo3: 'en fazla 3',
    yourPhoto: n => `Fotoğrafın ${n}`,
    removePhoto: n => `${n}. fotoğrafı kaldır`,
    addingPhotos: 'Fotoğrafların ekleniyor…',
    signingUp: 'Kaydediliyor…',
    signUp: 'Kaydol',
    errors: {
      photoFailed: 'Fotoğraf eklenemedi. Lütfen tekrar dene.',
      picksLost: 'Seçimlerin ulaşmadı. Geri dön ve tekrar seç.',
      whatsapp: `WhatsApp numaranı ülke koduyla yaz, örneğin ${SHOOT.phoneExample}.`,
      instagram: 'Instagram kullanıcı adını yaz, link olmadan.',
      noLocation: 'Nerede olduğunu yaz.',
      noPhoto: 'En az bir fotoğrafını ekle.',
      saveFailed: 'Kaydın gönderilemedi. Seçimlerin hâlâ burada — lütfen tekrar dene.',
    },
  },
  ru: {
    languageName: 'Russian',
    dates: 'Сентябрь',
    city: 'Стамбул',
    headline: 'бесплатная фотосессия',
    note: { lead: 'Выбери стиль фото, который тебе нравится.', rest: ' Потом спланируем съёмку под него.' },
    skip: 'Пропустить',
    back: '← Назад',
    startOver: 'Начать заново',
    chooseRound: round => `Выбери одно фото, раунд ${round}`,
    chooseImage: alt => `Выбрать: ${alt}`,
    status: (round, saved, max) => `Раунд ${round}. Сохранено ${saved} из ${max} фото.`,
    choosePhotos: 'Выбери фото',
    signUpTitle: 'Теперь запишись.',
    signUpNote: 'Твой выбор сохранён. Заполни это, и я тебе напишу.',
    doneTitle: 'Готово.',
    doneNote: 'Я напишу тебе, чтобы спланировать съёмку.',
    whereToMessage: 'Куда тебе написать?',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    whatsappLabel: 'Номер WhatsApp',
    instagramLabel: 'Имя пользователя Instagram',
    instagramPlaceholder: '@твойник',
    followHint: { before: 'Пожалуйста, подпишись на ', after: ', иначе я не смогу тебе написать.' },
    whereAreYou: 'Где ты сейчас?',
    whereAreYouPlaceholder: 'Kadıköy, Beşiktaş, Beyoğlu, Üsküdar…',
    notes: 'Заметки',
    optional: 'необязательно',
    photosOfYou: 'Твои фото',
    upTo3: 'до 3',
    yourPhoto: n => `Твоё фото ${n}`,
    removePhoto: n => `Удалить фото ${n}`,
    addingPhotos: 'Добавляю фото…',
    signingUp: 'Записываю…',
    signUp: 'Записаться',
    errors: {
      photoFailed: 'Не удалось добавить фото. Попробуй ещё раз.',
      picksLost: 'Твой выбор не дошёл. Вернись и выбери снова.',
      whatsapp: `Введи номер WhatsApp с кодом страны, например ${SHOOT.phoneExample}.`,
      instagram: 'Введи имя пользователя Instagram, без ссылки.',
      noLocation: 'Напиши, где ты сейчас.',
      noPhoto: 'Добавь хотя бы одно своё фото.',
      saveFailed: 'Запись не сохранилась. Твой выбор на месте — попробуй ещё раз.',
    },
  },
}

export function copyFor(lang: Lang): SignupCopy {
  return SIGNUP_COPY[lang]
}
