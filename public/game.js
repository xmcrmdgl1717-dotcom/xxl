/* ============================================================
 * 叠叠消 · 游戏主逻辑
 * ============================================================ */
(function () {
  'use strict';

  const icons = ['🍊','🥕','🌽','🍄','🌻','🐟','🦋','🍵'];

  const LANG = {
    en:{name:'Tile Trio',subtitle:'Pick top tiles · Match 3 to clear',currentLevel:'Level',remaining:'Tiles left',gameTime:'Game time',tray:'Tray',undo:'Undo',shuffle:'Shuffle',rescue:'Move out',once:'1 use left',ready:'Ready?',intro:'Pick uncovered tiles and match three. You lose if the tray fills up.',start:'Start game',share:'Share with friends',level:'Level {n}',win:'Level {n} complete!',warm:'Warm-up complete. Level 2 adds more layers and tile types.',streak:'You cleared {n} levels in {t}. The next level is trickier.',fail:'Tray full',failText:'So close! Prioritize symbols that already have a pair in the tray.',next:'Next level',retry:'Try again',blocked:'That tile is still covered',match:'Matched {x} × 3',restart:'Restart this level?',soundOn:'Sound on',soundOff:'Sound off',undone:'Last move undone',shuffled:'Tiles shuffled',moved:'Moved out {n} tiles',shareText:'Can you beat my time in Tile Trio?',copied:'Game link copied'},
    zh:{name:'叠叠消',subtitle:'点选最上层 · 三张同类即可消除',currentLevel:'当前关卡',remaining:'剩余牌',gameTime:'游戏用时',tray:'收集槽',undo:'撤回',shuffle:'洗牌',rescue:'移出',once:'剩余 1 次',ready:'准备好了吗？',intro:'从没有被遮住的牌开始，凑齐三个相同图案。收集槽满了就会失败。',start:'开始挑战',share:'分享给好友',level:'第 {n} 关',win:'第 {n} 关完成！',warm:'热身完成。第二关会加入更多叠层与图案。',streak:'你已连续闯过 {n} 关，用时 {t}。下一关会更复杂。',fail:'槽位满了',failText:'差一点！优先凑齐收集槽里已经有两张的图案。',next:'进入下一关',retry:'重试本关',blocked:'这张牌还被压着',match:'消除 {x} × 3',restart:'确定重新开始这一关吗？',soundOn:'音效已开启',soundOff:'音效已关闭',undone:'已撤回上一步',shuffled:'剩余牌已重新排列',moved:'移出了 {n} 张牌',shareText:'来挑战叠叠消，看看谁的通关时间更快！',copied:'游戏链接已复制'},
    zht:{name:'疊疊消',subtitle:'點選最上層 · 三張同類即可消除',currentLevel:'目前關卡',remaining:'剩餘牌',gameTime:'遊戲用時',tray:'收集槽',undo:'撤回',shuffle:'洗牌',rescue:'移出',once:'剩餘 1 次',ready:'準備好了嗎？',intro:'從沒有被遮住的牌開始，湊齊三個相同圖案。收集槽滿了就會失敗。',start:'開始挑戰',share:'分享給好友',level:'第 {n} 關',win:'第 {n} 關完成！',warm:'熱身完成。第二關會加入更多疊層與圖案。',streak:'你已連續闖過 {n} 關，用時 {t}。下一關會更複雜。',fail:'槽位滿了',failText:'差一點！優先湊齊收集槽裡已有兩張的圖案。',next:'進入下一關',retry:'重試本關',blocked:'這張牌還被壓著',match:'消除 {x} × 3',restart:'確定重新開始這一關嗎？',soundOn:'音效已開啟',soundOff:'音效已關閉',undone:'已撤回上一步',shuffled:'剩餘牌已重新排列',moved:'移出了 {n} 張牌',shareText:'來挑戰疊疊消，看看誰的通關時間更快！',copied:'遊戲連結已複製'},
    ja:{name:'タイルトリオ',subtitle:'一番上を選択 · 3枚で消去',currentLevel:'レベル',remaining:'残り',gameTime:'タイム',tray:'トレイ',undo:'戻す',shuffle:'シャッフル',rescue:'移動',once:'残り1回',ready:'準備OK？',intro:'覆われていないタイルを選び、3枚そろえよう。トレイが埋まると失敗です。',start:'スタート',share:'友達にシェア',level:'レベル {n}',win:'レベル {n} クリア！',warm:'ウォームアップ完了。次はレイヤーと種類が増えます。',streak:'{n}レベルクリア、タイム {t}。次はさらに難しくなります。',fail:'トレイが満杯',failText:'惜しい！同じ絵柄が2枚あるものを優先しよう。',next:'次のレベル',retry:'もう一度',blocked:'まだ上にタイルがあります',match:'{x} × 3 を消去',restart:'このレベルをやり直しますか？',soundOn:'サウンドON',soundOff:'サウンドOFF',undone:'1手戻しました',shuffled:'シャッフルしました',moved:'{n}枚移動しました',shareText:'タイルトリオで私のタイムに挑戦！',copied:'リンクをコピーしました'},
    ko:{name:'타일 트리오',subtitle:'맨 위 타일 선택 · 3개를 맞춰 제거',currentLevel:'레벨',remaining:'남은 타일',gameTime:'플레이 시간',tray:'보관함',undo:'되돌리기',shuffle:'섞기',rescue:'빼기',once:'1회 남음',ready:'준비됐나요?',intro:'가려지지 않은 타일을 골라 3개를 맞추세요. 보관함이 차면 실패합니다.',start:'게임 시작',share:'친구에게 공유',level:'레벨 {n}',win:'레벨 {n} 완료!',warm:'연습 완료! 다음 레벨은 층과 타일 종류가 늘어납니다.',streak:'{n}개 레벨 완료, 기록 {t}. 다음 레벨은 더 어렵습니다.',fail:'보관함이 찼어요',failText:'아쉬워요! 이미 두 개 모인 그림부터 맞춰 보세요.',next:'다음 레벨',retry:'다시 하기',blocked:'아직 가려진 타일입니다',match:'{x} × 3 제거',restart:'이 레벨을 다시 시작할까요?',soundOn:'소리 켜짐',soundOff:'소리 꺼짐',undone:'한 수 되돌렸어요',shuffled:'타일을 섞었어요',moved:'타일 {n}개를 뺐어요',shareText:'타일 트리오에서 내 기록에 도전해 봐!',copied:'게임 링크 복사됨'},
    es:{name:'Trío de fichas',subtitle:'Elige las superiores · Une 3',currentLevel:'Nivel',remaining:'Restantes',gameTime:'Tiempo',tray:'Bandeja',undo:'Deshacer',shuffle:'Mezclar',rescue:'Sacar',once:'Queda 1 uso',ready:'¿Preparado?',intro:'Elige fichas libres y reúne tres iguales. Pierdes si se llena la bandeja.',start:'Empezar',share:'Compartir',level:'Nivel {n}',win:'¡Nivel {n} completado!',warm:'Calentamiento listo. El nivel 2 añade capas y símbolos.',streak:'Superaste {n} niveles en {t}. El siguiente será más difícil.',fail:'Bandeja llena',failText:'¡Casi! Prioriza los símbolos de los que ya tienes dos.',next:'Siguiente nivel',retry:'Reintentar',blocked:'Esa ficha sigue cubierta',match:'{x} × 3 eliminadas',restart:'¿Reiniciar este nivel?',soundOn:'Sonido activado',soundOff:'Sonido desactivado',undone:'Movimiento deshecho',shuffled:'Fichas mezcladas',moved:'Se sacaron {n} fichas',shareText:'¿Puedes superar mi tiempo en Trío de fichas?',copied:'Enlace copiado'},
    fr:{name:'Trio de tuiles',subtitle:'Choisissez au-dessus · Alignez 3',currentLevel:'Niveau',remaining:'Restantes',gameTime:'Temps',tray:'Réserve',undo:'Annuler',shuffle:'Mélanger',rescue:'Sortir',once:'1 utilisation',ready:'Prêt ?',intro:'Choisissez les tuiles libres et réunissez-en trois. La partie est perdue si la réserve est pleine.',start:'Commencer',share:'Partager',level:'Niveau {n}',win:'Niveau {n} terminé !',warm:'Échauffement réussi. Le niveau 2 ajoute des couches et symboles.',streak:'{n} niveaux terminés en {t}. Le prochain sera plus difficile.',fail:'Réserve pleine',failText:'Presque ! Privilégiez les symboles déjà présents par deux.',next:'Niveau suivant',retry:'Réessayer',blocked:'Cette tuile est encore couverte',match:'{x} × 3 éliminées',restart:'Recommencer ce niveau ?',soundOn:'Son activé',soundOff:'Son désactivé',undone:'Coup annulé',shuffled:'Tuiles mélangées',moved:'{n} tuiles sorties',shareText:'Peux-tu battre mon temps à Trio de tuiles ?',copied:'Lien copié'},
    de:{name:'Kachel-Trio',subtitle:'Oberste wählen · 3 gleiche entfernen',currentLevel:'Level',remaining:'Übrig',gameTime:'Spielzeit',tray:'Ablage',undo:'Zurück',shuffle:'Mischen',rescue:'Ablegen',once:'1 Einsatz',ready:'Bereit?',intro:'Wähle freie Kacheln und sammle drei gleiche. Eine volle Ablage beendet das Spiel.',start:'Starten',share:'Teilen',level:'Level {n}',win:'Level {n} geschafft!',warm:'Aufwärmen geschafft. Level 2 bringt mehr Ebenen und Symbole.',streak:'{n} Level in {t} geschafft. Das nächste wird schwieriger.',fail:'Ablage voll',failText:'Fast! Entferne zuerst Symbole, von denen schon zwei liegen.',next:'Nächstes Level',retry:'Nochmal',blocked:'Diese Kachel ist noch bedeckt',match:'{x} × 3 entfernt',restart:'Dieses Level neu starten?',soundOn:'Ton an',soundOff:'Ton aus',undone:'Zug rückgängig',shuffled:'Kacheln gemischt',moved:'{n} Kacheln abgelegt',shareText:'Schlägst du meine Zeit bei Kachel-Trio?',copied:'Link kopiert'},
    pt:{name:'Trio de peças',subtitle:'Escolha as de cima · Combine 3',currentLevel:'Nível',remaining:'Restantes',gameTime:'Tempo',tray:'Bandeja',undo:'Desfazer',shuffle:'Misturar',rescue:'Retirar',once:'1 uso restante',ready:'Pronto?',intro:'Escolha peças livres e junte três iguais. Você perde se a bandeja encher.',start:'Começar',share:'Compartilhar',level:'Nível {n}',win:'Nível {n} concluído!',warm:'Aquecimento concluído. O nível 2 adiciona camadas e símbolos.',streak:'Você passou {n} níveis em {t}. O próximo será mais difícil.',fail:'Bandeja cheia',failText:'Quase! Priorize os símbolos dos quais já há dois.',next:'Próximo nível',retry:'Tentar de novo',blocked:'Essa peça ainda está coberta',match:'{x} × 3 removidas',restart:'Reiniciar este nível?',soundOn:'Som ligado',soundOff:'Som desligado',undone:'Jogada desfeita',shuffled:'Peças misturadas',moved:'{n} peças retiradas',shareText:'Consegue bater meu tempo no Trio de peças?',copied:'Link copiado'},
    ru:{name:'Три плитки',subtitle:'Берите верхние · Соберите 3',currentLevel:'Уровень',remaining:'Осталось',gameTime:'Время',tray:'Лоток',undo:'Отмена',shuffle:'Перемешать',rescue:'Убрать',once:'Остался 1 раз',ready:'Готовы?',intro:'Выбирайте открытые плитки и собирайте по три. Полный лоток — проигрыш.',start:'Начать',share:'Поделиться',level:'Уровень {n}',win:'Уровень {n} пройден!',warm:'Разминка окончена. На уровне 2 больше слоёв и символов.',streak:'Пройдено уровней: {n}, время: {t}. Дальше сложнее.',fail:'Лоток заполнен',failText:'Почти! Сначала собирайте символы, которых уже два.',next:'Следующий',retry:'Повторить',blocked:'Эта плитка ещё закрыта',match:'Убрано {x} × 3',restart:'Перезапустить уровень?',soundOn:'Звук включён',soundOff:'Звук выключен',undone:'Ход отменён',shuffled:'Плитки перемешаны',moved:'Убрано плиток: {n}',shareText:'Сможешь побить моё время в «Три плитки»?',copied:'Ссылка скопирована'},
    ar:{name:'ثلاثي البلاط',subtitle:'اختر البلاط العلوي · طابق 3',currentLevel:'المستوى',remaining:'المتبقي',gameTime:'الوقت',tray:'الصينية',undo:'تراجع',shuffle:'خلط',rescue:'إخراج',once:'استخدام واحد',ready:'هل أنت مستعد؟',intro:'اختر البلاط المكشوف واجمع ثلاثة متشابهة. تمتلئ الصينية فتخسر.',start:'ابدأ',share:'مشاركة',level:'المستوى {n}',win:'اكتمل المستوى {n}!',warm:'اكتمل التمهيد. يضيف المستوى الثاني طبقات ورموزاً أكثر.',streak:'أنهيت {n} مستويات خلال {t}. التالي أصعب.',fail:'الصينية ممتلئة',failText:'كدت تنجح! ابدأ بالرموز التي لديك منها اثنان.',next:'المستوى التالي',retry:'إعادة المحاولة',blocked:'هذه القطعة ما زالت مغطاة',match:'تمت مطابقة {x} × 3',restart:'إعادة هذا المستوى؟',soundOn:'الصوت يعمل',soundOff:'الصوت متوقف',undone:'تم التراجع',shuffled:'تم خلط البلاط',moved:'تم إخراج {n} قطع',shareText:'هل يمكنك تحطيم وقتي في ثلاثي البلاط؟',copied:'تم نسخ الرابط'},
    ur:{name:'ٹائل ٹرائیو',subtitle:'اوپر والی ٹائل چنیں · 3 ملائیں',currentLevel:'لیول',remaining:'باقی ٹائلیں',gameTime:'کھیل کا وقت',tray:'ٹرے',undo:'واپس',shuffle:'ملائیں',rescue:'باہر کریں',once:'1 بار باقی',ready:'تیار ہیں؟',intro:'کھلی ٹائلیں چنیں اور تین ایک جیسی ملائیں۔ ٹرے بھرنے پر کھیل ختم ہو جائے گا۔',start:'کھیل شروع کریں',share:'دوستوں سے شیئر کریں',level:'لیول {n}',win:'لیول {n} مکمل!',warm:'ابتدائی مرحلہ مکمل۔ لیول 2 میں مزید تہیں اور نشان شامل ہوں گے۔',streak:'آپ نے {t} میں {n} لیول مکمل کیے۔ اگلا لیول زیادہ مشکل ہے۔',fail:'ٹرے بھر گئی',failText:'بہت قریب! پہلے ان نشانات کو ملائیں جن میں سے دو پہلے ہی موجود ہیں۔',next:'اگلا لیول',retry:'دوبارہ کوشش',blocked:'یہ ٹائل ابھی ڈھکی ہوئی ہے',match:'{x} × 3 ختم',restart:'یہ لیول دوبارہ شروع کریں؟',soundOn:'آواز آن',soundOff:'آواز بند',undone:'چال واپس ہو گئی',shuffled:'ٹائلیں ملا دی گئیں',moved:'{n} ٹائلیں باہر کی گئیں',shareText:'کیا آپ ٹائل ٹرائیو میں میرا وقت ہرا سکتے ہیں؟',copied:'گیم لنک کاپی ہو گیا'},
    vi:{name:'Bộ Ba Ô Gạch',subtitle:'Chọn ô trên cùng · Ghép 3 ô',currentLevel:'Màn',remaining:'Ô còn lại',gameTime:'Thời gian',tray:'Khay',undo:'Hoàn tác',shuffle:'Xáo trộn',rescue:'Bỏ ra',once:'Còn 1 lần',ready:'Sẵn sàng?',intro:'Chọn các ô không bị che và ghép ba ô giống nhau. Khay đầy là thua.',start:'Bắt đầu chơi',share:'Chia sẻ với bạn bè',level:'Màn {n}',win:'Hoàn thành màn {n}!',warm:'Khởi động xong. Màn 2 sẽ có thêm nhiều lớp và loại ô.',streak:'Bạn đã vượt qua {n} màn trong {t}. Màn tiếp theo khó hơn.',fail:'Khay đã đầy',failText:'Suýt nữa! Hãy ưu tiên các biểu tượng đã có hai ô.',next:'Màn tiếp theo',retry:'Chơi lại',blocked:'Ô này vẫn bị che',match:'Đã ghép {x} × 3',restart:'Chơi lại màn này?',soundOn:'Bật âm thanh',soundOff:'Tắt âm thanh',undone:'Đã hoàn tác',shuffled:'Đã xáo trộn ô',moved:'Đã bỏ {n} ô',shareText:'Bạn có thể vượt qua thời gian của tôi trong Bộ Ba Ô Gạch không?',copied:'Đã sao chép liên kết'},
    hi:{name:'टाइल ट्रायो',subtitle:'ऊपरी टाइल चुनें · 3 मिलाएँ',currentLevel:'लेवल',remaining:'बाकी टाइल',gameTime:'समय',tray:'ट्रे',undo:'वापस',shuffle:'फेंटें',rescue:'बाहर करें',once:'1 बार बाकी',ready:'तैयार?',intro:'खुली टाइल चुनें और तीन समान मिलाएँ। ट्रे भरने पर खेल खत्म होगा।',start:'शुरू करें',share:'दोस्तों को भेजें',level:'लेवल {n}',win:'लेवल {n} पूरा!',warm:'अभ्यास पूरा। लेवल 2 में अधिक परतें और चिन्ह हैं।',streak:'आपने {t} में {n} लेवल पूरे किए। अगला कठिन है।',fail:'ट्रे भर गई',failText:'बहुत करीब! जिन चिन्हों के दो हैं, उन्हें पहले मिलाएँ।',next:'अगला लेवल',retry:'फिर कोशिश',blocked:'यह टाइल अभी ढकी है',match:'{x} × 3 हटे',restart:'यह लेवल फिर शुरू करें?',soundOn:'आवाज़ चालू',soundOff:'आवाज़ बंद',undone:'चाल वापस हुई',shuffled:'टाइल फेंटी गईं',moved:'{n} टाइल बाहर कीं',shareText:'टाइल ट्रायो में मेरा समय हरा सकते हो?',copied:'लिंक कॉपी हुआ'},
    th:{name:'ไทล์ทรีโอ',subtitle:'เลือกแผ่นบนสุด · จับคู่ 3',currentLevel:'ด่าน',remaining:'เหลือ',gameTime:'เวลา',tray:'ช่องเก็บ',undo:'ย้อนกลับ',shuffle:'สลับ',rescue:'นำออก',once:'เหลือ 1 ครั้ง',ready:'พร้อมไหม?',intro:'เลือกแผ่นที่ไม่ถูกบังและจับคู่ให้ครบสาม ช่องเก็บเต็มจะจบเกม',start:'เริ่มเกม',share:'แชร์ให้เพื่อน',level:'ด่าน {n}',win:'ผ่านด่าน {n}!',warm:'ผ่านช่วงฝึกแล้ว ด่าน 2 จะมีหลายชั้นและรูปมากขึ้น',streak:'ผ่าน {n} ด่านใน {t} ด่านถัดไปยากขึ้น',fail:'ช่องเก็บเต็ม',failText:'เกือบแล้ว! จับคู่รูปที่มีอยู่สองแผ่นก่อน',next:'ด่านถัดไป',retry:'ลองใหม่',blocked:'แผ่นนี้ยังถูกบังอยู่',match:'ลบ {x} × 3',restart:'เริ่มด่านนี้ใหม่?',soundOn:'เปิดเสียง',soundOff:'ปิดเสียง',undone:'ย้อนกลับแล้ว',shuffled:'สลับแผ่นแล้ว',moved:'นำออก {n} แผ่น',shareText:'มาแข่งเวลาในไทล์ทรีโอกัน!',copied:'คัดลอกลิงก์แล้ว'},
    id:{name:'Trio Ubin',subtitle:'Pilih paling atas · Cocokkan 3',currentLevel:'Level',remaining:'Tersisa',gameTime:'Waktu',tray:'Baki',undo:'Urungkan',shuffle:'Acak',rescue:'Keluarkan',once:'Sisa 1 kali',ready:'Siap?',intro:'Pilih ubin yang terbuka dan cocokkan tiga. Baki penuh berarti kalah.',start:'Mulai',share:'Bagikan',level:'Level {n}',win:'Level {n} selesai!',warm:'Pemanasan selesai. Level 2 punya lebih banyak lapisan dan simbol.',streak:'Kamu menyelesaikan {n} level dalam {t}. Berikutnya lebih sulit.',fail:'Baki penuh',failText:'Hampir! Dahulukan simbol yang sudah terkumpul dua.',next:'Level berikutnya',retry:'Coba lagi',blocked:'Ubin ini masih tertutup',match:'{x} × 3 dihapus',restart:'Mulai ulang level ini?',soundOn:'Suara aktif',soundOff:'Suara mati',undone:'Langkah dibatalkan',shuffled:'Ubin diacak',moved:'{n} ubin dikeluarkan',shareText:'Bisakah kamu mengalahkan waktuku di Trio Ubin?',copied:'Tautan disalin'}
  };

  /* iOS 非 Safari 引导弹窗文案（16 种语言） */
  const GATE = {
    en: ['Use Safari to open',        'For the best experience, copy the link below and open it in Safari.',                        '📋 Copy link',           '✅ Link copied. Open Safari and paste to visit.',        'Copy failed. Long-press the link above to copy manually.'],
    zh: ['请用 Safari 打开',           '为了获得最佳游戏体验，请复制下方链接，打开 Safari 后粘贴访问。',                                 '📋 复制链接',              '✅ 已复制，请打开 Safari 粘贴访问',                       '复制失败，请长按上方链接手动复制'],
    zht:['請用 Safari 開啟',           '為了獲得最佳遊戲體驗，請複製下方連結，開啟 Safari 後貼上訪問。',                                '📋 複製連結',              '✅ 已複製，請開啟 Safari 貼上訪問',                       '複製失敗，請長按上方連結手動複製'],
    ja: ['Safari で開いてください',      '最高の体験のために、下のリンクをコピーして Safari で開いてください。',                            '📋 リンクをコピー',          '✅ コピーしました。Safari を開いて貼り付けてください',      'コピーに失敗しました。上のリンクを長押ししてコピーしてください'],
    ko: ['Safari로 열어주세요',        '최상의 경험을 위해 아래 링크를 복사하여 Safari에서 열어주세요.',                                '📋 링크 복사',             '✅ 복사되었습니다. Safari를 열어 붙여넣기 하세요',          '복사 실패. 위 링크를 길게 눌러 복사하세요'],
    es: ['Abre con Safari',           'Para una mejor experiencia, copia el enlace y ábrelo en Safari.',                               '📋 Copiar enlace',        '✅ Copiado. Abre Safari y pega el enlace.',               'Error al copiar. Mantén pulsado el enlace para copiarlo.'],
    fr: ['Ouvrez avec Safari',        'Pour une meilleure expérience, copiez le lien et ouvrez-le dans Safari.',                        '📋 Copier le lien',        '✅ Copié. Ouvrez Safari et collez le lien.',              'Échec de la copie. Appuyez longuement sur le lien.'],
    de: ['Mit Safari öffnen',         'Für das beste Erlebnis kopiere den Link und öffne ihn in Safari.',                               '📋 Link kopieren',         '✅ Kopiert. Öffne Safari und füge den Link ein.',          'Kopieren fehlgeschlagen. Link lange drücken.'],
    pt: ['Abra com Safari',           'Para a melhor experiência, copie o link e abra no Safari.',                                      '📋 Copiar link',           '✅ Copiado. Abra o Safari e cole o link.',                'Falha ao copiar. Toque e segure o link.'],
    ru: ['Откройте в Safari',         'Для лучшего опыта скопируйте ссылку и откройте её в Safari.',                                     '📋 Копировать ссылку',      '✅ Скопировано. Откройте Safari и вставьте ссылку.',       'Не удалось скопировать. Удерживайте ссылку.'],
    ar: ['افتح في Safari',            'للحصول على أفضل تجربة، انسخ الرابط وافتحه في Safari.',                                            '📋 نسخ الرابط',             '✅ تم النسخ. افتح Safari والصق الرابط.',                   'فشل النسخ. اضغط مطولاً على الرابط.'],
    ur: ['Safari میں کھولیں',         'بہترین تجربے کے لیے لنک کاپی کریں اور Safari میں کھولیں۔',                                        '📋 لنک کاپی کریں',          '✅ کاپی ہو گیا۔ Safari کھولیں اور پیسٹ کریں۔',             'کاپی ناکام۔ لنک کو دیر تک دبائیں۔'],
    vi: ['Mở bằng Safari',            'Để có trải nghiệm tốt nhất, hãy sao chép liên kết và mở trong Safari.',                           '📋 Sao chép liên kết',     '✅ Đã sao chép. Mở Safari và dán liên kết.',              'Sao chép thất bại. Nhấn giữ liên kết để sao chép.'],
    hi: ['Safari में खोलें',            'बेहतर अनुभव के लिए लिंक कॉपी करें और Safari में खोलें।',                                          '📋 लिंक कॉपी करें',         '✅ कॉपी हो गया। Safari खोलें और पेस्ट करें।',              'कॉपी विफल। लिंक को देर तक दबाएँ।'],
    th: ['เปิดด้วย Safari',           'เพื่อประสบการณ์ที่ดีที่สุด คัดลอกลิงก์และเปิดใน Safari',                                            '📋 คัดลอกลิงก์',            '✅ คัดลอกแล้ว เปิด Safari แล้ววางลิงก์',                    'คัดลอกไม่สำเร็จ กดลิงก์ค้างเพื่อคัดลอก'],
    id: ['Buka dengan Safari',        'Untuk pengalaman terbaik, salin tautan dan buka di Safari.',                                     '📋 Salin tautan',          '✅ Tersalin. Buka Safari dan tempel tautan.',              'Gagal menyalin. Tekan lama tautan di atas.'],
  };

  /* 初始化语言：URL > localStorage > window.__DDX_LANG > 系统 */
  const rawLang = (
    new URLSearchParams(location.search).get('lang') ||
    localStorage.getItem('ddx-lang') ||
    window.__DDX_LANG ||
    navigator.languages?.[0] || navigator.language || 'en'
  ).toLowerCase();

  function pickLang(c) {
    return c === 'zht' ? 'zht'
         : c.startsWith('zh-tw') || c.startsWith('zh-hk') || c.startsWith('zh-mo') || c.startsWith('zh-hant') ? 'zht'
         : c.startsWith('zh') ? 'zh'
         : (Object.keys(LANG).find(k => c.startsWith(k)) || 'en');
  }

  let currentLang = pickLang(rawLang);

  const tr = (key, vars = {}) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v),
      (LANG[currentLang]?.[key] || LANG.en[key] || key));

  function applyGateText() {
    const g = GATE[currentLang] || GATE.en;
    const t1 = document.getElementById('browserTitle');
    const t2 = document.getElementById('browserText');
    const t3 = document.getElementById('copyForSafari');
    const u  = document.getElementById('noticeUrl');
    if (t1) t1.textContent = g[0];
    if (t2) t2.textContent = g[1];
    if (t3) t3.textContent = g[2];
    if (u)  u.textContent  = location.href;
  }

  function applyLang(code) {
    const c = String(code || 'en').toLowerCase();
    currentLang = pickLang(c);
    window.__DDX_LANG = c;
    document.documentElement.lang = c;
    document.documentElement.dir = (currentLang === 'ar' || currentLang === 'ur') ? 'rtl' : 'ltr';
    document.title = LANG[currentLang]?.name || LANG.en.name;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = LANG[currentLang]?.[el.dataset.i18n] || LANG.en[el.dataset.i18n] || el.dataset.i18n;
    });

    applyGateText();

    const lvEl = document.getElementById('level');
    if (lvEl && typeof S !== 'undefined' && S) lvEl.textContent = (LANG[currentLang]?.level || LANG.en.level).replace('{n}', S.level);
    const btn = document.getElementById('modalBtn');
    if (btn && btn.dataset.i18n) btn.textContent = LANG[currentLang]?.[btn.dataset.i18n] || LANG.en[btn.dataset.i18n];
  }
  window.__DDX_applyLang = applyLang;

  /* ============ 状态 ============ */
  const S = {
    tiles: [], tray: [], history: [],
    used: { undo:false, shuffle:false, rescue:false },
    combo: 0, sound: true, playing: false,
    level: 1, activeSeconds: 0, nextLevel: false,
  };
  const $ = s => document.querySelector(s);
  const board = $('#board');
  const trayEl = $('#tray');

  /* S 已定义，执行首屏语言渲染 */
  applyLang(rawLang);

  let _ac = null;
  function getAC() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    if (_ac.state === 'suspended') _ac.resume();
    return _ac;
  }

  function seededTiles(level) {
    const groups = level === 1 ? 6 : level === 2 ? 12 : 20;
    const vals = [];
    for (let i = 0; i < groups; i++)
      for (let j = 0; j < 3; j++)
        vals.push(icons[i % (level === 1 ? 4 : icons.length)]);
    for (let i = vals.length - 1; i; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vals[i], vals[j]] = [vals[j], vals[i]];
    }
    const t = [];
    let id = 0;
    const layers = level === 1
      ? [{ n:12, cols:4, ox:130, oy:72 }, { n:6, cols:3, ox:164, oy:132 }]
      : level === 2
      ? [{ n:18, cols:6, ox:70,  oy:40 }, { n:12, cols:4, ox:130, oy:94 }, { n:6, cols:3, ox:164, oy:150 }]
      : [{ n:24, cols:6, ox:62,  oy:20 }, { n:18, cols:6, ox:76,  oy:72 }, { n:12, cols:4, ox:130, oy:126 }, { n:6, cols:3, ox:164, oy:182 }];

    layers.forEach((L, z) => {
      for (let k = 0; k < L.n; k++) {
        const r = Math.floor(k / L.cols), c = k % L.cols;
        t.push({ id: id++, icon: vals.pop(), z, x: L.ox + c * 66 + (r % 2) * 7, y: L.oy + r * 72, removed: false });
      }
    });
    if (level === 1) {
      const bottom = [...Array(3).fill(icons[0]), ...Array(3).fill(icons[1]), ...Array(3).fill(icons[2]), ...Array(3).fill(icons[3])].sort(() => Math.random() - .5);
      const top    = [...Array(3).fill(icons[0]), ...Array(3).fill(icons[1])].sort(() => Math.random() - .5);
      t.filter(x => x.z === 0).forEach((x, i) => x.icon = bottom[i]);
      t.filter(x => x.z === 1).forEach((x, i) => x.icon = top[i]);
    }
    return t;
  }

  function fit() { render(); }

  function isBlocked(t) {
    return S.tiles.some(o => !o.removed && o.z > t.z && Math.abs(o.x - t.x) < 54 && Math.abs(o.y - t.y) < 58);
  }

  function render() {
    board.innerHTML = '';
    const w = board.clientWidth, h = board.clientHeight || 400;
    const scale = Math.min(1, (w - 12) / 520, (h - 12) / 382);
    const offset = Math.max(3, (w - 520 * scale) / 2);
    const top    = Math.max(3, (h - 382 * scale) / 2);

    S.tiles.filter(t => !t.removed).sort((a, b) => a.z - b.z).forEach(t => {
      const b = document.createElement('button');
      b.className = 'tile' + (isBlocked(t) ? ' blocked' : '');
      b.textContent = t.icon;
      b.setAttribute('aria-label', isBlocked(t) ? `${t.icon}，被遮挡` : `选择 ${t.icon}`);
      b.style.cssText = `left:${offset + t.x * scale}px;top:${top + t.y * scale}px;--s:${scale};z-index:${t.z}`;
      b.dataset.id = t.id;
      b.onclick = () => pick(t.id);
      board.appendChild(b);
    });

    trayEl.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const d = document.createElement('div');
      d.className = 'slot' + (S.tray[i] ? ' filled' : '');
      d.textContent = S.tray[i]?.icon || '';
      trayEl.appendChild(d);
    }

    $('#level').textContent = tr('level', { n: S.level });
    $('#remain').textContent = S.tiles.filter(t => !t.removed).length;
    $('#trayCount').textContent = `${S.tray.length} / 7`;
    $('#undo').disabled    = S.used.undo || !S.history.length;
    $('#shuffle').disabled = S.used.shuffle;
    $('#rescue').disabled  = S.used.rescue || !S.tray.length;
  }

  function pick(id) {
    if (!S.playing) return;
    if (S.tray.length >= 7) return;
    const t = S.tiles.find(x => x.id === id);
    if (!t || t.removed || isBlocked(t)) return buzz(tr('blocked'));
    S.history.push({ id, tray: [...S.tray], combo: S.combo });
    t.removed = true;
    S.tray.push({ icon: t.icon, source: id });
    tone(460);
    resolveTray();
  }

  function resolveTray() {
    const counts = {};
    S.tray.forEach(x => counts[x.icon] = (counts[x.icon] || 0) + 1);
    const hit = Object.keys(counts).find(k => counts[k] >= 3);
    if (hit) {
      const removing = S.tray.filter(x => x.icon === hit).slice(0, 3);
      const removeIds = removing.map(x => x.source);
      removeIds.forEach(id => {
        const el = board.querySelector(`.tile[data-id="${id}"]`);
        if (el) el.classList.add('removing');
      });
      setTimeout(() => {
        const set = new Set(removeIds);
        S.tray = S.tray.filter(x => !set.has(x.source));
        S.combo++;
        tone(720);
        buzz(tr('match', { x: hit }));
        render();
        document.querySelectorAll('.slot').forEach(x => x.classList.add('pop'));
        setTimeout(checkEnd, 220);
      }, 220);
      return;
    }
    S.combo = 0;
    render();
    setTimeout(checkEnd, 220);
  }

  function checkEnd() {
    if (!S.tiles.some(t => !t.removed)) {
      const best = Math.max(+localStorage.getItem('ddx-best') || 0, S.combo);
      localStorage.setItem('ddx-best', best);
      finish(true);
    } else if (S.tray.length >= 7) {
      finish(false);
    }
  }

  function finish(win) {
    S.playing = false;
    S.nextLevel = win;
    $('#modalHero').textContent = win ? '🎉' : '😵';
    $('#modalTitle').textContent = win ? tr('win', { n: S.level }) : tr('fail');
    $('#modalText').textContent = win
      ? (S.level === 1 ? tr('warm') : tr('streak', { n: S.level, t: formatTime(S.activeSeconds) }))
      : tr('failText');
    $('#modalBtn').textContent = win ? tr('next') : tr('retry');
    $('#modal').classList.remove('hidden');
    if (window.DDX_TRACK) {
      window.DDX_TRACK.onLevel(S.level, win ? S.level : S.level - 1, S.activeSeconds);
    }
  }

  function start(level) {
    S.level = level || 1;
    S.tiles = seededTiles(S.level);
    S.tray = [];
    S.history = [];
    S.used = { undo:false, shuffle:false, rescue:false };
    S.combo = 0;
    S.playing = true;
    S.nextLevel = false;
    $('#modal').classList.add('hidden');
    render();
  }

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  setInterval(() => {
    if (!S.playing) return;
    S.activeSeconds++;
    $('#timer').textContent = formatTime(S.activeSeconds);
  }, 1000);

  function buzz(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(buzz.timer);
    buzz.timer = setTimeout(() => t.classList.remove('show'), 1600);
  }

  function tone(freq) {
    if (!S.sound) return;
    try {
      const a = getAC();
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(.05, a.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .12);
      o.start(); o.stop(a.currentTime + .12);
    } catch (e) {}
  }

  async function shareGame() {
    const data = { title: tr('name'), text: tr('shareText'), url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); buzz(tr('copied')); }
    } catch (e) {
      if (e.name !== 'AbortError') {
        try { await navigator.clipboard.writeText(location.href); buzz(tr('copied')); } catch (_) {}
      }
    }
  }

  /* ============ iOS 非 Safari 引导 ============ */
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua)
    && !/(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA|MicroMessenger|FBAN|FBAV|Instagram|Line|TikTok|Twitter|LinkedIn|Baidu|Sogou|Quark|UCBrowser)/i.test(ua);

  if (isIOS && !isSafari && !sessionStorage.getItem('browser-notice-dismissed')) {
    const box = $('#browserNotice');
    if (box) {
      box.classList.remove('hidden');
      const u = document.getElementById('noticeUrl');
      if (u) u.textContent = location.href;
      applyGateText();
    }
  }

  /* 复制完整链接（含所有参数），复制成功后自动关闭弹窗 */
  $('#copyForSafari').onclick = async () => {
    const url = location.href;   // 完整 URL，包含 ?lang=xxx 等所有参数
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch (e) {}
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok = true;
      } catch (e) {}
    }
    const g = GATE[currentLang] || GATE.en;
    buzz(ok ? g[3] : g[4]);
    if (ok) {
      // 1.5 秒后自动关闭弹窗
      setTimeout(() => {
        $('#browserNotice').classList.add('hidden');
        sessionStorage.setItem('browser-notice-dismissed', '1');
      }, 1500);
    }
  };

  $('#share').onclick = shareGame;
  $('#modalShare').onclick = shareGame;
  $('#modalBtn').onclick = () => {
    if (S.nextLevel) start(S.level + 1);
    else { S.activeSeconds = 0; $('#timer').textContent = '00:00'; start(S.level); }
  };
  $('#restart').onclick = () => {
    if (confirm(tr('restart'))) {
      S.activeSeconds = 0;
      $('#timer').textContent = '00:00';
      start(S.level);
    }
  };
  $('#sound').onclick = () => {
    S.sound = !S.sound;
    $('#sound').textContent = S.sound ? '🔊' : '🔇';
    buzz(tr(S.sound ? 'soundOn' : 'soundOff'));
  };
  $('#undo').onclick = () => {
    if (S.used.undo || !S.history.length) return;
    const h = S.history.pop();
    S.tiles.find(t => t.id === h.id).removed = false;
    S.tray = h.tray;
    S.combo = h.combo;
    S.used.undo = true;
    buzz(tr('undone'));
    render();
  };
  $('#shuffle').onclick = () => {
    if (S.used.shuffle) return;
    const active = S.tiles.filter(t => !t.removed);
    const vals = active.map(t => t.icon).sort(() => Math.random() - .5);
    active.forEach((t, i) => t.icon = vals[i]);
    S.used.shuffle = true;
    buzz(tr('shuffled'));
    render();
  };
  $('#rescue').onclick = () => {
    if (S.used.rescue || !S.tray.length) return;
    const out = S.tray.splice(0, Math.min(3, S.tray.length));
    out.forEach(x => {
      const t = S.tiles.find(t => t.id === x.source);
      if (t) t.removed = false;
    });
    S.history = S.history.filter(h => !out.some(o => o.source === h.id));
    S.used.rescue = true;
    buzz(tr('moved', { n: out.length }));
    render();
  };

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 180));
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(board);

  window.__DDX_getLevel = () => S.level;
  window.__DDX_getPlaySeconds = () => S.activeSeconds;

  render();
})();


/* ============================================================
 * 叠叠消 · 埋点 + 语言选择器
 * ============================================================ */
(function () {
  'use strict';

  const LANGS = [
    { code:'en', name:'English',          region:'US' },
    { code:'zh', name:'简体中文',         region:'CN' },
    { code:'es', name:'Español',          region:'ES' },
    { code:'ar', name:'العربية',           region:'SA' },
    { code:'pt', name:'Português',        region:'BR' },
    { code:'id', name:'Bahasa Indonesia', region:'ID' },
    { code:'fr', name:'Français',         region:'FR' },
    { code:'ja', name:'日本語',            region:'JP' },
    { code:'ru', name:'Русский',          region:'RU' },
    { code:'de', name:'Deutsch',          region:'DE' },
    { code:'ko', name:'한국어',            region:'KR' },
    { code:'vi', name:'Tiếng Việt',       region:'VN' },
    { code:'tr', name:'Türkçe',           region:'TR' },
    { code:'hi', name:'हिन्दी',             region:'IN' },
    { code:'th', name:'ไทย',              region:'TH' },
  ];

  const COUNTRY_LANG = {
    CN:'zh',TW:'zht',HK:'zht',MO:'zht',SG:'en',
    US:'en',GB:'en',AU:'en',CA:'en',NZ:'en',IE:'en',IN:'en',PH:'en',
    ES:'es',MX:'es',AR:'es',CO:'es',CL:'es',PE:'es',VE:'es',UY:'es',
    SA:'ar',AE:'ar',EG:'ar',DZ:'ar',MA:'ar',IQ:'ar',JO:'ar',KW:'ar',QA:'ar',
    BR:'pt',PT:'pt', ID:'id',
    FR:'fr',BE:'fr',CH:'fr',SN:'fr',CI:'fr',CM:'fr',
    JP:'ja', RU:'ru',KZ:'ru',UA:'ru',BY:'ru',
    DE:'de',AT:'de', KR:'ko', VN:'vi', TR:'tr', TH:'th',
  };

  const urlLang = new URLSearchParams(location.search).get('lang');
  const saved   = localStorage.getItem('ddx-lang');
  const device  = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();

  function deviceToCode(l) {
    if (l.startsWith('zh-tw') || l.startsWith('zh-hk') || l.startsWith('zh-mo') || l.startsWith('zh-hant')) return 'zht';
    if (l.startsWith('zh')) return 'zh';
    return LANGS.find(x => l.startsWith(x.code))?.code || 'en';
  }
  async function ipToCode() {
    try {
      const r = await fetch('/api/track/geo', { credentials: 'same-origin' });
      const j = await r.json();
      if (j && j.country) return COUNTRY_LANG[j.country] || null;
    } catch (e) {}
    return null;
  }
  async function resolveLang() {
    if (urlLang && LANGS.some(x => x.code === urlLang)) return urlLang;
    if (saved) return saved;
    const ipc = await ipToCode();
    if (ipc) return ipc;
    return deviceToCode(device);
  }

  async function fingerprint() {
    const raw = [
      navigator.userAgent, screen.width + 'x' + screen.height,
      screen.colorDepth, new Date().getTimezoneOffset(),
      navigator.language, navigator.hardwareConcurrency, navigator.platform,
    ].join('|');
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      return 'fp_' + hex.slice(0, 10);
    } catch {
      return 'fp_' + Math.random().toString(36).slice(2, 12);
    }
  }

  const SESSION_KEY = 'ddx-session-id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  let visibleSeconds = 0;
  let lastTick = Date.now();
  let hbInterval = 30;

  function getCurrentLevel() {
    try {
      if (typeof window.__DDX_getLevel === 'function') return window.__DDX_getLevel();
      const el = document.getElementById('level');
      if (!el) return 1;
      const m = String(el.textContent).match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 1;
    } catch { return 1; }
  }
  function getPlaySeconds() {
    try {
      if (typeof window.__DDX_getPlaySeconds === 'function') return window.__DDX_getPlaySeconds();
      return 0;
    } catch { return 0; }
  }

  function post(path, data, beacon) {
    const url = '/api/track' + path;
    const body = JSON.stringify(data);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => {});
  }

  document.addEventListener('visibilitychange', () => {
    const now = Date.now();
    if (document.visibilityState === 'visible') lastTick = now;
    else visibleSeconds += (now - lastTick) / 1000;
  });

  window.DDX_TRACK = {
    onLevel(lv, cleared, playSec) {
      post('/level', { session_id: sessionId, level_reached: lv, levels_cleared: cleared, play_seconds: playSec });
    },
    onLang(lang) { post('/lang', { session_id: sessionId, lang }); },
  };

  (async function init() {
    try {
      const r = await fetch('/api/track/config', { credentials: 'same-origin' });
      const j = await r.json();
      hbInterval = j.heartbeat_interval || 30;
    } catch (e) {}

    const lang = urlLang || saved || await resolveLang();
    window.__DDX_LANG = lang;
    if (typeof window.__DDX_applyLang === 'function') window.__DDX_applyLang(lang);

    const fp = await fingerprint();
    post('/enter', { session_id: sessionId, fingerprint: fp, lang, referrer: document.referrer || '' });

    lastTick = Date.now();
    setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === 'visible') visibleSeconds += (now - lastTick) / 1000;
      lastTick = now;
      post('/heartbeat', {
        session_id: sessionId,
        visible_seconds: Math.round(visibleSeconds),
        level_reached: getCurrentLevel(),
        play_seconds: getPlaySeconds(),
      });
    }, hbInterval * 1000);

    const leave = () => post('/leave', { session_id: sessionId, visible_seconds: Math.round(visibleSeconds) }, true);
    window.addEventListener('pagehide', leave);
    window.addEventListener('beforeunload', leave);
  })();

  function openLangPicker() {
    const cur = window.__DDX_LANG || 'en';
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:200;display:grid;place-items:end center';
    const box = document.createElement('div');
    box.style.cssText = 'width:min(520px,100%);max-height:70vh;overflow:auto;background:#fff7dc;border-radius:20px 20px 0 0;padding:16px';
    box.innerHTML = '<div style="font-weight:800;margin-bottom:10px">🌐 选择语言 / Language</div>' +
      LANGS.map(l => `<button data-code="${l.code}" style="display:flex;width:100%;align-items:center;gap:10px;padding:12px;border:0;background:${l.code===cur?'#ffe9a8':'transparent'};border-radius:12px;font-size:15px;cursor:pointer;text-align:left"><span>${l.name}</span><span style="margin-left:auto;color:#7a8a80;font-size:12px">${l.code}</span></button>`).join('');
    ov.appendChild(box);
    document.body.appendChild(ov);
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    box.querySelectorAll('button[data-code]').forEach(b => b.onclick = () => {
      const code = b.dataset.code;
      localStorage.setItem('ddx-lang', code);
      window.DDX_TRACK.onLang(code);
      if (typeof window.__DDX_applyLang === 'function') window.__DDX_applyLang(code);
      ov.remove();
    });
  }
  document.getElementById('langBtn').onclick = openLangPicker;
})();
