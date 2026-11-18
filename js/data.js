/*!
 * The Holy Rosary — prayer texts and mysteries.
 *
 * English: the traditional Catholic forms in common use.
 * Latin:   the traditional Latin forms.
 * Scripture quotations: Douay-Rheims Bible (public domain).
 *
 * Paragraph formats used in prayer texts:
 *   'text'             prayed by all (or by the leader, when a response follows)
 *   { resp: 'text' }   the response (second half, when praying in a group)
 *   { v: 'text' }      versicle   (V.)
 *   { r: 'text' }      response   (R.)
 *   { say: 'text' }    e.g. "Let us pray."
 *   { note: 'text' }   an instruction (rubric)
 */
(function () {
  'use strict';

  var prayers = {
    sign: {
      title: { en: 'The Sign of the Cross', la: 'Signum Crucis' },
      en: ['In the name of the Father, and of the Son, and of the Holy Spirit. Amen.'],
      la: ['In nomine Patris, et Filii, et Spiritus Sancti. Amen.']
    },

    creed: {
      title: { en: 'The Apostles’ Creed', la: 'Symbolum Apostolorum' },
      about: 'The ancient baptismal creed of the Church of Rome — a summary of the faith of the Apostles.',
      en: [
        'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead.',
        'I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.'
      ],
      la: [
        'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos.',
        'Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.'
      ]
    },

    ourFather: {
      title: { en: 'Our Father', la: 'Pater Noster' },
      about: 'The prayer Jesus Himself taught His disciples (Matthew 6:9–13).',
      en: [
        'Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come, Thy will be done on earth as it is in heaven.',
        { resp: 'Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.' }
      ],
      la: [
        'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra.',
        { resp: 'Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.' }
      ]
    },

    hailMary: {
      title: { en: 'Hail Mary', la: 'Ave Maria' },
      about: 'The words of the Angel Gabriel and of St. Elizabeth (Luke 1:28, 42), joined to the Church’s petition.',
      en: [
        'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.',
        { resp: 'Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.' }
      ],
      la: [
        'Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus.',
        { resp: 'Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.' }
      ]
    },

    gloryBe: {
      title: { en: 'Glory Be', la: 'Gloria Patri' },
      about: 'The Lesser Doxology — praise of the Most Holy Trinity.',
      en: [
        'Glory be to the Father, and to the Son, and to the Holy Spirit.',
        { resp: 'As it was in the beginning, is now, and ever shall be, world without end. Amen.' }
      ],
      la: [
        'Gloria Patri, et Filio, et Spiritui Sancto.',
        { resp: 'Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.' }
      ]
    },

    fatima: {
      title: { en: 'O My Jesus (The Fatima Prayer)', la: 'Oratio Fatimae' },
      short: 'O My Jesus',
      about: 'Taught by Our Lady to the three shepherd children at Fatima in 1917, to be prayed after each decade.',
      en: ['O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to heaven, especially those in most need of Thy mercy. Amen.'],
      la: ['Domine Iesu, dimitte nobis debita nostra, salva nos ab igne inferiori, perduc in caelum omnes animas, praesertim eas, quae misericordiae tuae maxime indigent. Amen.']
    },

    hailHolyQueen: {
      title: { en: 'Hail, Holy Queen', la: 'Salve Regina' },
      about: 'One of the great Marian antiphons of the Church, dating from the eleventh century. It is prayed after the fifth decade.',
      en: [
        'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.',
        { v: 'Pray for us, O holy Mother of God.' },
        { r: 'That we may be made worthy of the promises of Christ.' }
      ],
      la: [
        'Salve, Regina, Mater misericordiae, vita, dulcedo, et spes nostra, salve. Ad te clamamus, exsules filii Hevae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia ergo, advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, O pia, O dulcis Virgo Maria.',
        { v: 'Ora pro nobis, sancta Dei Genetrix.' },
        { r: 'Ut digni efficiamur promissionibus Christi.' }
      ]
    },

    rosaryPrayer: {
      title: { en: 'Concluding Prayer of the Rosary', la: 'Oratio' },
      short: 'Concluding Prayer',
      about: 'The Collect of the Feast of Our Lady of the Rosary (October 7), said after the Hail, Holy Queen.',
      en: [
        { say: 'Let us pray.' },
        'O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life; grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.'
      ],
      la: [
        { say: 'Oremus.' },
        'Deus, cuius Unigenitus per vitam, mortem et resurrectionem suam nobis salutis aeternae praemia comparavit: concede, quaesumus; ut haec mysteria sacratissimo beatae Mariae Virginis Rosario recolentes, et imitemur quod continent, et quod promittunt assequamur. Per eundem Christum Dominum nostrum. Amen.'
      ]
    },

    litany: {
      title: { en: 'Litany of the Blessed Virgin Mary', la: 'Litaniae Lauretanae' },
      subtitle: 'The Litany of Loreto',
      about: 'Approved by Pope Sixtus V in 1587. Later popes added titles, most recently Mother of Mercy, Mother of Hope, and Solace of Migrants (2020). It is customarily prayed after the Hail, Holy Queen.',
      litany: null, // filled in below
      after: {
        en: [
          { v: 'Pray for us, O holy Mother of God.' },
          { r: 'That we may be made worthy of the promises of Christ.' },
          { say: 'Let us pray.' },
          'Grant, we beseech Thee, O Lord God, that we Thy servants may enjoy perpetual health of mind and body; and by the glorious intercession of the Blessed Mary, ever Virgin, may be delivered from present sorrow, and obtain eternal joy. Through Christ our Lord. Amen.'
        ],
        la: [
          { v: 'Ora pro nobis, sancta Dei Genetrix.' },
          { r: 'Ut digni efficiamur promissionibus Christi.' },
          { say: 'Oremus.' },
          'Concede nos famulos tuos, quaesumus, Domine Deus, perpetua mentis et corporis sanitate gaudere: et gloriosa beatae Mariae semper Virginis intercessione, a praesenti liberari tristitia, et aeterna perfrui laetitia. Per Christum Dominum nostrum. Amen.'
        ]
      }
    },

    subTuum: {
      title: { en: 'We Fly to Thy Protection', la: 'Sub Tuum Praesidium' },
      about: 'The oldest known prayer to the Mother of God, found on an Egyptian papyrus from the third or fourth century.',
      en: ['We fly to thy protection, O holy Mother of God. Despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen.'],
      la: ['Sub tuum praesidium confugimus, sancta Dei Genetrix. Nostras deprecationes ne despicias in necessitatibus nostris, sed a periculis cunctis libera nos semper, Virgo gloriosa et benedicta. Amen.']
    },

    michael: {
      title: { en: 'Prayer to Saint Michael the Archangel', la: 'Oratio ad Sanctum Michaelem' },
      short: 'Saint Michael the Archangel',
      about: 'Composed by Pope Leo XIII in the 1880s.',
      en: ['Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.'],
      la: ['Sancte Michael Archangele, defende nos in proelio; contra nequitiam et insidias diaboli esto praesidium. Imperet illi Deus, supplices deprecamur: tuque, Princeps militiae caelestis, Satanam aliosque spiritus malignos, qui ad perditionem animarum pervagantur in mundo, divina virtute in infernum detrude. Amen.']
    },

    memorare: {
      title: { en: 'The Memorare', la: 'Memorare' },
      about: 'Traditionally attributed to St. Bernard of Clairvaux.',
      en: ['Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.'],
      la: ['Memorare, O piissima Virgo Maria, non esse auditum a saeculo, quemquam ad tua currentem praesidia, tua implorantem auxilia, tua petentem suffragia, esse derelictum. Ego tali animatus confidentia, ad te, Virgo virginum, Mater, curro, ad te venio, coram te gemens peccator assisto. Noli, Mater Verbi, verba mea despicere; sed audi propitia et exaudi. Amen.']
    },

    pope: {
      title: { en: 'For the Intentions of the Holy Father', la: 'Pro intentionibus Summi Pontificis' },
      about: 'Prayer for the intentions of the Pope is one of the usual conditions for gaining a plenary indulgence.',
      en: [{ note: 'Pray one Our Father, one Hail Mary, and one Glory Be for the intentions of the Holy Father.' }],
      la: [{ note: 'Pater Noster, Ave Maria, et Gloria Patri pro intentionibus Summi Pontificis.' }]
    }
  };

  /* ---------- Litany of Loreto ---------- */
  // [English, Latin] — each answered with "pray for us" / "ora pro nobis".
  var marian = [
    ['Holy Mary', 'Sancta Maria'],
    ['Holy Mother of God', 'Sancta Dei Genetrix'],
    ['Holy Virgin of virgins', 'Sancta Virgo virginum'],
    ['Mother of Christ', 'Mater Christi'],
    ['Mother of the Church', 'Mater Ecclesiae'],
    ['Mother of Mercy', 'Mater misericordiae'],
    ['Mother of divine grace', 'Mater divinae gratiae'],
    ['Mother of Hope', 'Mater spei'],
    ['Mother most pure', 'Mater purissima'],
    ['Mother most chaste', 'Mater castissima'],
    ['Mother inviolate', 'Mater inviolata'],
    ['Mother undefiled', 'Mater intemerata'],
    ['Mother most amiable', 'Mater amabilis'],
    ['Mother most admirable', 'Mater admirabilis'],
    ['Mother of good counsel', 'Mater boni consilii'],
    ['Mother of our Creator', 'Mater Creatoris'],
    ['Mother of our Savior', 'Mater Salvatoris'],
    ['Virgin most prudent', 'Virgo prudentissima'],
    ['Virgin most venerable', 'Virgo veneranda'],
    ['Virgin most renowned', 'Virgo praedicanda'],
    ['Virgin most powerful', 'Virgo potens'],
    ['Virgin most merciful', 'Virgo clemens'],
    ['Virgin most faithful', 'Virgo fidelis'],
    ['Mirror of justice', 'Speculum iustitiae'],
    ['Seat of wisdom', 'Sedes sapientiae'],
    ['Cause of our joy', 'Causa nostrae laetitiae'],
    ['Spiritual vessel', 'Vas spirituale'],
    ['Vessel of honor', 'Vas honorabile'],
    ['Singular vessel of devotion', 'Vas insigne devotionis'],
    ['Mystical rose', 'Rosa mystica'],
    ['Tower of David', 'Turris Davidica'],
    ['Tower of ivory', 'Turris eburnea'],
    ['House of gold', 'Domus aurea'],
    ['Ark of the covenant', 'Foederis arca'],
    ['Gate of heaven', 'Ianua caeli'],
    ['Morning star', 'Stella matutina'],
    ['Health of the sick', 'Salus infirmorum'],
    ['Refuge of sinners', 'Refugium peccatorum'],
    ['Solace of migrants', 'Solacium migrantium'],
    ['Comforter of the afflicted', 'Consolatrix afflictorum'],
    ['Help of Christians', 'Auxilium Christianorum'],
    ['Queen of Angels', 'Regina Angelorum'],
    ['Queen of Patriarchs', 'Regina Patriarcharum'],
    ['Queen of Prophets', 'Regina Prophetarum'],
    ['Queen of Apostles', 'Regina Apostolorum'],
    ['Queen of Martyrs', 'Regina Martyrum'],
    ['Queen of Confessors', 'Regina Confessorum'],
    ['Queen of Virgins', 'Regina Virginum'],
    ['Queen of all Saints', 'Regina Sanctorum omnium'],
    ['Queen conceived without original sin', 'Regina sine labe originali concepta'],
    ['Queen assumed into heaven', 'Regina in caelum assumpta'],
    ['Queen of the most holy Rosary', 'Regina sacratissimi Rosarii'],
    ['Queen of families', 'Regina familiae'],
    ['Queen of peace', 'Regina pacis']
  ];

  prayers.litany.litany = {
    en: [
      [
        ['Lord, have mercy.', 'Lord, have mercy.'],
        ['Christ, have mercy.', 'Christ, have mercy.'],
        ['Lord, have mercy.', 'Lord, have mercy.'],
        ['Christ, hear us.', 'Christ, graciously hear us.']
      ],
      [
        ['God the Father of heaven,', 'have mercy on us.'],
        ['God the Son, Redeemer of the world,', 'have mercy on us.'],
        ['God the Holy Spirit,', 'have mercy on us.'],
        ['Holy Trinity, one God,', 'have mercy on us.']
      ],
      marian.map(function (m) { return [m[0] + ',', 'pray for us.']; }),
      [
        ['Lamb of God, who takes away the sins of the world,', 'spare us, O Lord.'],
        ['Lamb of God, who takes away the sins of the world,', 'graciously hear us, O Lord.'],
        ['Lamb of God, who takes away the sins of the world,', 'have mercy on us.']
      ]
    ],
    la: [
      [
        ['Kyrie, eleison.', 'Kyrie, eleison.'],
        ['Christe, eleison.', 'Christe, eleison.'],
        ['Kyrie, eleison.', 'Kyrie, eleison.'],
        ['Christe, audi nos.', 'Christe, exaudi nos.']
      ],
      [
        ['Pater de caelis, Deus,', 'miserere nobis.'],
        ['Fili, Redemptor mundi, Deus,', 'miserere nobis.'],
        ['Spiritus Sancte, Deus,', 'miserere nobis.'],
        ['Sancta Trinitas, unus Deus,', 'miserere nobis.']
      ],
      marian.map(function (m) { return [m[1] + ',', 'ora pro nobis.']; }),
      [
        ['Agnus Dei, qui tollis peccata mundi,', 'parce nobis, Domine.'],
        ['Agnus Dei, qui tollis peccata mundi,', 'exaudi nos, Domine.'],
        ['Agnus Dei, qui tollis peccata mundi,', 'miserere nobis.']
      ]
    ]
  };

  /* ---------- The Mysteries ---------- */
  var mysteries = {
    joyful: {
      key: 'joyful',
      name: 'The Joyful Mysteries',
      short: 'Joyful',
      days: 'Monday & Saturday',
      season: 'Also customary on the Sundays of Advent and Christmastide',
      intro: 'The Incarnation and the hidden life of Jesus — the joy of God coming to dwell among us.',
      items: [
        {
          title: 'The Annunciation',
          ref: 'Luke 1:26–38',
          quote: 'Behold the handmaid of the Lord; be it done to me according to thy word.',
          quoteRef: 'Luke 1:38',
          fruit: 'Humility',
          med: 'The Angel Gabriel is sent to a virgin of Nazareth and greets her as “full of grace.” Mary believes the word of God and gives her humble “yes” — and the Word is made flesh and dwells among us.'
        },
        {
          title: 'The Visitation',
          ref: 'Luke 1:39–56',
          quote: 'Blessed art thou among women, and blessed is the fruit of thy womb.',
          quoteRef: 'Luke 1:42',
          fruit: 'Love of neighbor',
          med: 'Carrying the Lord within her, Mary hastens to serve her kinswoman Elizabeth. John leaps for joy in his mother’s womb, and Mary proclaims the greatness of the Lord in her Magnificat.'
        },
        {
          title: 'The Nativity of Our Lord',
          ref: 'Luke 2:1–20',
          quote: 'And she brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.',
          quoteRef: 'Luke 2:7',
          fruit: 'Poverty of spirit',
          med: 'In a stable at Bethlehem the Son of God is born in poverty and laid in a manger. Angels proclaim peace on earth, and humble shepherds are the first to come and adore Him.'
        },
        {
          title: 'The Presentation in the Temple',
          ref: 'Luke 2:22–38',
          quote: 'Because my eyes have seen thy salvation, which thou hast prepared before the face of all peoples: a light to the revelation of the Gentiles, and the glory of thy people Israel.',
          quoteRef: 'Luke 2:30–32',
          fruit: 'Obedience',
          med: 'Faithful to the Law, Mary and Joseph present the Child Jesus to the Lord. Holy Simeon takes Him in his arms, hails Him as the Light of the nations, and foretells the sword that will pierce Mary’s heart.'
        },
        {
          title: 'The Finding of Jesus in the Temple',
          ref: 'Luke 2:41–52',
          quote: 'How is it that you sought me? did you not know, that I must be about my father’s business?',
          quoteRef: 'Luke 2:49',
          fruit: 'Joy in finding Jesus',
          med: 'After three days of sorrowful searching, Mary and Joseph find the twelve-year-old Jesus in the Temple among the teachers. He must be about His Father’s business, yet He returns with them to Nazareth and is obedient to them.'
        }
      ]
    },

    luminous: {
      key: 'luminous',
      name: 'The Luminous Mysteries',
      short: 'Luminous',
      days: 'Thursday',
      intro: 'The public ministry of Jesus — the Light of the world revealed. Added by Pope St. John Paul II in 2002.',
      items: [
        {
          title: 'The Baptism of Our Lord in the Jordan',
          ref: 'Matthew 3:13–17',
          quote: 'And behold a voice from heaven, saying: This is my beloved Son, in whom I am well pleased.',
          quoteRef: 'Matthew 3:17',
          fruit: 'Openness to the Holy Spirit',
          med: 'Though He is without sin, Jesus goes down into the waters of the Jordan. The heavens open, the Holy Spirit descends upon Him like a dove, and the voice of the Father proclaims Him the beloved Son.'
        },
        {
          title: 'The Wedding Feast at Cana',
          ref: 'John 2:1–11',
          quote: 'His mother saith to the waiters: Whatsoever he shall say to you, do ye.',
          quoteRef: 'John 2:5',
          fruit: 'To Jesus through Mary',
          med: 'At a wedding feast Mary notices the need and brings it to her Son. At her intercession Jesus works His first sign, changing water into wine — and her words still guide every disciple: “Whatsoever he shall say to you, do ye.”'
        },
        {
          title: 'The Proclamation of the Kingdom of God',
          ref: 'Mark 1:14–15',
          quote: 'The time is accomplished, and the kingdom of God is at hand: repent, and believe the gospel.',
          quoteRef: 'Mark 1:15',
          fruit: 'Repentance and trust in God',
          med: 'Jesus proclaims that the Kingdom of God is at hand and calls all to conversion. He forgives sinners, heals the sick, and welcomes everyone who comes to Him in faith.'
        },
        {
          title: 'The Transfiguration',
          ref: 'Matthew 17:1–8',
          quote: 'And he was transfigured before them. And his face did shine as the sun: and his garments became white as snow.',
          quoteRef: 'Matthew 17:2',
          fruit: 'Desire for holiness',
          med: 'On a high mountain the glory of God shines from the face of Jesus before Peter, James, and John. The Father commands, “This is my most beloved Son… hear ye him,” strengthening the disciples for the Cross to come.'
        },
        {
          title: 'The Institution of the Eucharist',
          ref: 'Luke 22:14–20',
          quote: 'This is my body, which is given for you. Do this for a commemoration of me.',
          quoteRef: 'Luke 22:19',
          fruit: 'Adoration',
          med: 'At the Last Supper, on the night before He suffers, Jesus gives us His Body and Blood under the signs of bread and wine — and remains with us always in the Most Holy Eucharist.'
        }
      ]
    },

    sorrowful: {
      key: 'sorrowful',
      name: 'The Sorrowful Mysteries',
      short: 'Sorrowful',
      days: 'Tuesday & Friday',
      season: 'Also customary on the Sundays of Lent',
      intro: 'The Passion of Our Lord — the depth of His love, poured out for our salvation.',
      items: [
        {
          title: 'The Agony in the Garden',
          ref: 'Luke 22:39–46',
          quote: 'Father, if thou wilt, remove this chalice from me: but yet not my will, but thine be done.',
          quoteRef: 'Luke 22:42',
          fruit: 'Sorrow for sin',
          med: 'In the Garden of Gethsemane Jesus is overwhelmed with sorrow at the weight of the world’s sin. His sweat becomes like drops of blood, yet He surrenders Himself completely to the will of the Father.'
        },
        {
          title: 'The Scourging at the Pillar',
          ref: 'John 19:1',
          quote: 'Then therefore, Pilate took Jesus, and scourged him.',
          quoteRef: 'John 19:1',
          fruit: 'Purity',
          med: 'Jesus is bound to a pillar and cruelly scourged. He bears these wounds in silence for our sins — “by his bruises we are healed.”'
        },
        {
          title: 'The Crowning with Thorns',
          ref: 'Matthew 27:27–31',
          quote: 'And platting a crown of thorns, they put it upon his head, and a reed in his right hand. And bowing the knee before him, they mocked him, saying: Hail, king of the Jews.',
          quoteRef: 'Matthew 27:29',
          fruit: 'Courage',
          med: 'The soldiers clothe Jesus in purple, press a crown of thorns upon His head, and mock Him as a king. The true King of heaven and earth endures their contempt with meekness and love.'
        },
        {
          title: 'The Carrying of the Cross',
          ref: 'John 19:16–17; Luke 23:26–32',
          quote: 'And bearing his own cross, he went forth to that place which is called Calvary, but in Hebrew Golgotha.',
          quoteRef: 'John 19:17',
          fruit: 'Patience',
          med: 'Weakened and wounded, Jesus carries His Cross to Calvary, and Simon of Cyrene is made to help Him. He consoles the weeping women of Jerusalem, and invites us to take up our own cross and follow Him.'
        },
        {
          title: 'The Crucifixion and Death of Our Lord',
          ref: 'Luke 23:33–46; John 19:25–30',
          quote: 'Father, into thy hands I commend my spirit.',
          quoteRef: 'Luke 23:46',
          fruit: 'Perseverance',
          med: 'Jesus is nailed to the Cross and dies for our salvation. From the Cross He forgives His executioners, promises Paradise to the repentant thief, and gives us His own Mother: “Behold thy mother.”'
        }
      ]
    },

    glorious: {
      key: 'glorious',
      name: 'The Glorious Mysteries',
      short: 'Glorious',
      days: 'Wednesday & Sunday',
      intro: 'The victory of the risen Christ and the glory He shares with His Mother — the hope of eternal life.',
      items: [
        {
          title: 'The Resurrection',
          ref: 'Matthew 28:1–10',
          quote: 'He is not here, for he is risen, as he said. Come, and see the place where the Lord was laid.',
          quoteRef: 'Matthew 28:6',
          fruit: 'Faith',
          med: 'On the third day Jesus rises gloriously from the dead, conquering sin and death forever. The tomb is empty, and the angel announces to the holy women that the Lord is risen, as He said.'
        },
        {
          title: 'The Ascension',
          ref: 'Acts 1:6–11',
          quote: 'And when he had said these things, while they looked on, he was raised up: and a cloud received him out of their sight.',
          quoteRef: 'Acts 1:9',
          fruit: 'Hope',
          med: 'Forty days after rising from the dead, Jesus blesses His disciples and ascends into heaven. He goes to prepare a place for us, and He will come again in glory.'
        },
        {
          title: 'The Descent of the Holy Spirit',
          ref: 'Acts 1:14; 2:1–13',
          quote: 'And they were all filled with the Holy Ghost, and they began to speak with divers tongues, according as the Holy Ghost gave them to speak.',
          quoteRef: 'Acts 2:4',
          fruit: 'Love of God',
          med: 'As the Apostles pray together with Mary in the upper room, the Holy Spirit descends upon them in tongues of fire. Filled with courage, they go out to proclaim Christ to all nations.'
        },
        {
          title: 'The Assumption of Mary',
          ref: 'Revelation 12:1; Luke 1:48–49',
          quote: 'For behold from henceforth all generations shall call me blessed.',
          quoteRef: 'Luke 1:48',
          fruit: 'Grace of a happy death',
          med: 'Having completed the course of her earthly life, the Immaculate Virgin Mary is taken up body and soul into heavenly glory — the first to share fully in her Son’s Resurrection, and a sign of sure hope for us all.'
        },
        {
          title: 'The Coronation of Mary as Queen of Heaven and Earth',
          ref: 'Revelation 12:1',
          quote: 'And a great sign appeared in heaven: A woman clothed with the sun, and the moon under her feet, and on her head a crown of twelve stars.',
          quoteRef: 'Revelation 12:1',
          fruit: 'Trust in Mary’s intercession',
          med: 'Mary is crowned Queen of Heaven and Earth, sharing in the glory of her Son. As our Mother and Queen she never ceases to intercede for us and to lead us to Jesus.'
        }
      ]
    }
  };

  window.ROSARY = {
    prayers: prayers,
    mysteries: mysteries,
    order: ['joyful', 'luminous', 'sorrowful', 'glorious'],
    ordinals: ['First', 'Second', 'Third', 'Fourth', 'Fifth']
  };
})();
