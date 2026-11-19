import { useEffect, useMemo, useRef, useState } from 'react'

type Word = { en: string; uz: string; icon: string }
type Level = { name: string; icon: string; color: string; words: Word[] }
type Progress = {
  learned: Record<string, boolean>
  scores: number[]
  lastVisit: string
  streak: number
}
type Screen = 'home' | 'learn' | 'lessonDone' | 'quiz' | 'result' | 'champion' | 'review'

const levels: Level[] = [
  { name: 'Mevalar', icon: '🍎', color: '#ff8a9d', words: [
    ['Apple','Olma','🍎'],['Banana','Banan','🍌'],['Orange','Apelsin','🍊'],['Grape','Uzum','🍇'],['Lemon','Limon','🍋'],['Mango','Mango','🥭'],['Pear','Nok','🍐'],['Peach','Shaftoli','🍑'],['Cherry','Gilos','🍒'],['Watermelon','Tarvuz','🍉'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Hayvonlar', icon: '🐶', color: '#a68bf5', words: [
    ['Cat','Mushuk','🐱'],['Dog','It','🐶'],['Lion','Sher','🦁'],['Tiger',"Yo'lbars",'🐯'],['Bear','Ayiq','🐻'],['Rabbit','Quyon','🐰'],['Monkey','Maymun','🐵'],['Elephant','Fil','🐘'],['Fox','Tulki','🦊'],['Wolf',"Bo'ri",'🐺'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Ranglar', icon: '🎨', color: '#57c9b3', words: [
    ['Red','Qizil','🔴'],['Blue',"Ko'k",'🔵'],['Green','Yashil','🟢'],['Yellow','Sariq','🟡'],['Black','Qora','⚫'],['White','Oq','⚪'],['Pink','Pushti','🌸'],['Purple','Binafsha','🟣'],['Brown','Jigarrang','🟤'],['Orange',"To'q sariq",'🟠'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Raqamlar', icon: '🔢', color: '#f0bb44', words: [
    ['One','Bir','1️⃣'],['Two','Ikki','2️⃣'],['Three','Uch','3️⃣'],['Four',"To'rt",'4️⃣'],['Five','Besh','5️⃣'],['Six','Olti','6️⃣'],['Seven','Yetti','7️⃣'],['Eight','Sakkiz','8️⃣'],['Nine',"To'qqiz",'9️⃣'],['Ten',"O'n",'🔟'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Uy', icon: '🏠', color: '#6bb6f5', words: [
    ['House','Uy','🏠'],['Door','Eshik','🚪'],['Window','Deraza','🪟'],['Table','Stol','🪑'],['Chair','Stul','💺'],['Bed','Karavot','🛏️'],['Kitchen','Oshxona','🍳'],['Room','Xona','🛋️'],['Lamp','Chiroq','💡'],['Sofa','Divan','🛋️'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Oila', icon: '👨‍👩‍👧', color: '#ec8ac4', words: [
    ['Mother','Ona','👩'],['Father','Ota','👨'],['Sister','Opa / Singil','👧'],['Brother','Aka / Uka','👦'],['Baby','Chaqaloq','👶'],['Grandma','Buvi','👵'],['Grandpa','Bobo','👴'],['Family','Oila','👨‍👩‍👧'],['Uncle',"Amaki / Tog'a",'🧔'],['Aunt','Amma / Xola','👩‍🦱'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Taomlar', icon: '🍔', color: '#f39a55', words: [
    ['Bread','Non','🍞'],['Milk','Sut','🥛'],['Water','Suv','💧'],['Egg','Tuxum','🥚'],['Rice','Guruch','🍚'],['Meat',"Go'sht",'🥩'],['Cheese','Pishloq','🧀'],['Cake','Tort','🍰'],['Soup',"Sho'rva",'🍲'],['Juice','Sharbat','🧃'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Maktab', icon: '🎒', color: '#718ee8', words: [
    ['Book','Kitob','📘'],['Pen','Ruchka','🖊️'],['Pencil','Qalam','✏️'],['Bag','Sumka','🎒'],['Teacher',"O'qituvchi",'🧑‍🏫'],['Student',"O'quvchi",'🧒'],['Desk','Parta','🪑'],['Paper',"Qog'oz",'📄'],['Ruler',"Chizg'ich",'📏'],['School','Maktab','🏫'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Tabiat', icon: '🌍', color: '#62b96f', words: [
    ['Sun','Quyosh','☀️'],['Moon','Oy','🌙'],['Star','Yulduz','⭐'],['Tree','Daraxt','🌳'],['Flower','Gul','🌻'],['River','Daryo','🏞️'],['Mountain',"Tog'",'⛰️'],['Rain',"Yomg'ir",'🌧️'],['Cloud','Bulut','☁️'],['Sky','Osmon','🌤️'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
  { name: 'Kundalik ingliz tili', icon: '🚀', color: '#8b79dc', words: [
    ['Happy','Xursand','😊'],['Sad','Xafa','😔'],['Run','Yugurmoq','🏃'],['Walk','Yurmoq','🚶'],['Eat','Yemoq','😋'],['Drink','Ichmoq','🥤'],['Sleep','Uxlamoq','😴'],['Play',"O'ynamoq",'🪁'],['Read',"O'qimoq",'📖'],['Write','Yozmoq','✍️'],
  ].map(([en,uz,icon]) => ({en,uz,icon})) },
]

const initialProgress: Progress = { learned: {}, scores: Array(10).fill(0), lastVisit: '', streak: 1 }
const today = () => new Date().toISOString().slice(0, 10)
const keyFor = (level: number, word: number) => `${level}-${word}`

function loadProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem('little-english-progress') || 'null')
    if (saved && saved.learned && Array.isArray(saved.scores)) return { ...initialProgress, ...saved }
  } catch { /* local progress can safely start fresh */ }
  return initialProgress
}

function Mascot({ text = "Birga o‘rganamiz!" }: { text?: string }) {
  return (
    <div className="mascot-wrap" aria-label={`Boyo‘g‘li maskot: ${text}`}>
      <div className="mascot" aria-hidden="true"><span>🦉</span><i>⭐</i></div>
      <div className="mascot-bubble">{text}</div>
    </div>
  )
}

function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({length: 18}, (_, i) => <i key={i} style={{'--i': i} as React.CSSProperties}/>)}</div>
}

function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [screen, setScreen] = useState<Screen>('home')
  const [levelIndex, setLevelIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [wordTransition, setWordTransition] = useState(false)
  const [reward, setReward] = useState('')
  const [quizAt, setQuizAt] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState({score: 0, passed: false})
  const rewardTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const now = today()
    setProgress(p => {
      if (p.lastVisit === now) return p
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      return {...p, lastVisit: now, streak: p.lastVisit === yesterday ? p.streak + 1 : 1}
    })
  }, [])
  useEffect(() => {
    try { localStorage.setItem('little-english-progress', JSON.stringify(progress)) } catch { /* private mode */ }
  }, [progress])
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const learnedCount = Object.keys(progress.learned).filter(k => progress.learned[k]).length
  const completedCount = progress.scores.filter(s => s >= 8).length
  const stars = learnedCount + progress.scores.reduce((a,b) => a + b, 0) + completedCount * 3
  const unlockedCount = Math.min(10, completedCount + 1)
  const currentLevel = levels[levelIndex]
  const learnedInLevel = currentLevel.words.filter((_, i) => progress.learned[keyFor(levelIndex, i)]).length

  const speak = (text: string, slow = false) => {
    if (!('speechSynthesis' in window)) { setReward("Audio bu brauzerda ishlamaydi"); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || null
    utterance.lang = 'en-US'
    utterance.rate = slow ? .7 : .95
    utterance.pitch = 1.05
    utterance.onstart = () => setPlaying(true)
    utterance.onend = utterance.onerror = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const flash = (message: string) => {
    setReward(message)
    window.clearTimeout(rewardTimer.current)
    rewardTimer.current = window.setTimeout(() => setReward(''), 2400)
  }

  const openLevel = (i: number) => {
    if (i >= unlockedCount) { flash("Avvalgi bosqichni tugatsang, bu yo‘l ochiladi! 🔐"); return }
    setLevelIndex(i); setWordIndex(0); setScreen('learn'); window.scrollTo(0,0)
  }

  const markLearned = () => {
    if (wordTransition) return
    const key = keyFor(levelIndex, wordIndex)
    if (!progress.learned[key]) {
      setProgress(p => ({...p, learned: {...p.learned, [key]: true}}))
    }
    window.speechSynthesis?.cancel()
    setPlaying(false)
    setWordTransition(true)
    flash("Barakalla! ⭐")
    window.setTimeout(() => {
      if (wordIndex < 9) {
        setWordIndex(wordIndex + 1)
        setWordTransition(false)
      } else {
        setWordTransition(false)
        setScreen('lessonDone')
        window.scrollTo(0, 0)
      }
    }, 650)
  }

  const startQuiz = () => {
    setQuizAt(0); setQuizScore(0); setAnswer(null); setScreen('quiz'); window.scrollTo(0,0)
  }

  const quizOptions = useMemo(() => {
    const correct = levels[levelIndex].words[quizAt]
    if (!correct) return []
    const picks = [correct]
    for (let step = 1; picks.length < 4; step++) {
      const candidate = levels[levelIndex].words[(quizAt + step * 3) % 10]
      if (!picks.includes(candidate)) picks.push(candidate)
    }
    return picks.sort((a,b) => ((a.en.charCodeAt(0) + quizAt) % 7) - ((b.en.charCodeAt(0) + quizAt) % 7))
  }, [levelIndex, quizAt])

  const chooseAnswer = (word: Word) => {
    if (answer) return
    const correct = word.en === currentLevel.words[quizAt].en
    setAnswer(word.en)
    if (correct) { setQuizScore(s => s + 1); flash("Barakalla! To‘g‘ri javob! 🎉") }
    else flash("Yaxshi urinish! Keyingisini topamiz 😊")
  }

  const nextQuestion = () => {
    if (quizAt < 9) { setQuizAt(q => q + 1); setAnswer(null) }
    else {
      const finalScore = quizScore + (answer === currentLevel.words[quizAt].en ? 0 : 0)
      const passed = finalScore >= 8
      setProgress(p => {
        const scores = [...p.scores]
        scores[levelIndex] = Math.max(scores[levelIndex] || 0, finalScore)
        return {...p, scores}
      })
      setLastResult({score: finalScore, passed})
      setScreen(levelIndex === 9 && passed ? 'champion' : 'result')
      window.scrollTo(0,0)
    }
  }

  const resetProgress = () => {
    if (!window.confirm("Barcha yutuqlarni o‘chirib, boshidan boshlaysizmi?")) return
    window.speechSynthesis?.cancel()
    setProgress({...initialProgress, scores: Array(10).fill(0), lastVisit: today()})
    setLevelIndex(0); setScreen('home')
  }

  const goHome = () => { window.speechSynthesis?.cancel(); setPlaying(false); setScreen('home'); window.scrollTo(0,0) }
  const badges = [
    {icon:'🏆', name:'Birinchi bosqich', on: completedCount >= 1},
    {icon:'⭐', name:'10 ta so‘z', on: learnedCount >= 10},
    {icon:'🔥', name:'3 kunlik davom', on: progress.streak >= 3},
    {icon:'🎓', name:'Lug‘at ustasi', on: completedCount >= 5},
    {icon:'👑', name:'100 so‘z chempioni', on: completedCount === 10},
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="Bosh sahifaga qaytish">
          <span className="logo-mark">LE</span><span>Little English<small>O‘yna • O‘rgan • O‘s</small></span>
        </button>
        <div className="header-stats">
          <span title="Jami yulduzlar">⭐ <b>{stars}</b></span>
          <span title="O‘rganish davomiyligi">🔥 <b>{progress.streak}</b></span>
          {screen !== 'home' && <button className="home-button" onClick={goHome}>⌂ <span>Bosh sahifa</span></button>}
        </div>
      </header>

      {reward && <div className="toast" role="status">{reward}</div>}

      {screen === 'home' && <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">BUGUNGI SARGUZASHT</div>
            <h1>Salom, kichik ingliz tili bilimdoni! <span>👋</span></h1>
            <p>Bugun 10 ta yangi so‘z o‘rganamiz! 🚀</p>
            <div className="daily-progress">
              <div><b>{learnedCount}</b><span>100 ta so‘zdan</span></div>
              <div className="progress-track" aria-label={`${learnedCount} foiz bajarildi`}><i style={{width: `${learnedCount}%`}}/></div>
              <strong>{learnedCount}%</strong>
            </div>
            <button className="primary-button" onClick={() => openLevel(Math.min(completedCount, 9))}>
              {learnedCount ? 'Davom etamiz' : 'Sarguzashtni boshlash'} <span>→</span>
            </button>
          </div>
          <Mascot text={completedCount ? `Zo‘r! ${completedCount} bosqich tayyor!` : 'Seni kutgandim!'} />
          <div className="float-shape one">A</div><div className="float-shape two">⭐</div>
        </section>

        <section className="dashboard" aria-label="Natijalar">
          <article><span className="stat-icon blue">📚</span><div><b>{learnedCount} / 100</b><small>So‘z o‘rganildi</small></div></article>
          <article><span className="stat-icon purple">🏆</span><div><b>{completedCount} / 10</b><small>Bosqich tugadi</small></div></article>
          <article><span className="stat-icon yellow">⭐</span><div><b>{stars}</b><small>Jami yulduz</small></div></article>
          <article><span className="stat-icon pink">🎯</span><div><b>{progress.scores.reduce((a,b)=>a+b,0)}</b><small>To‘g‘ri javob</small></div></article>
        </section>

        <section className="map-section">
          <div className="section-heading"><div><span>SARGUZASHT XARITASI</span><h2>O‘rganish yo‘ling</h2></div><p>Har bir bekatda 10 ta yangi so‘z bor</p></div>
          <div className="level-map">
            <div className="path-line" aria-hidden="true"/>
            {levels.map((level, i) => {
              const unlocked = i < unlockedCount
              const count = level.words.filter((_, w) => progress.learned[keyFor(i,w)]).length
              const complete = progress.scores[i] >= 8
              const levelStars = complete ? (progress.scores[i] === 10 ? 3 : progress.scores[i] === 9 ? 2 : 1) : 0
              return <button key={level.name} className={`level-card ${unlocked ? 'unlocked' : 'locked'} ${complete ? 'complete' : ''}`} onClick={() => openLevel(i)} aria-label={`${i+1}-bosqich, ${level.name}, ${unlocked ? 'ochiq' : 'qulflangan'}`} style={{'--level': level.color} as React.CSSProperties}>
                <span className="map-node">{complete ? '✓' : unlocked ? i+1 : '🔒'}</span>
                <span className="level-illustration">{level.icon}</span>
                <span className="level-meta">{i+1}-BOSQICH {complete && <em>TUGADI</em>}</span>
                <strong>{level.name}</strong>
                <span className="word-count">📖 10 ta so‘z</span>
                <span className="mini-track"><i style={{width:`${count*10}%`}}/></span>
                <span className="card-foot"><span>{count}/10</span><span>{[0,1,2].map(s=><i key={s} className={s<levelStars?'earned':''}>★</i>)}</span></span>
              </button>
            })}
          </div>
        </section>

        <section className="achievements">
          <div className="section-heading"><div><span>YUTUQLAR</span><h2>Sening nishonlaring</h2></div></div>
          <div className="badge-grid">{badges.map(b => <article key={b.name} className={b.on ? 'active' : ''}><span>{b.on ? b.icon : '🔒'}</span><b>{b.name}</b><small>{b.on ? 'Qo‘lga kiritildi!' : 'Hali oldinda'}</small></article>)}</div>
        </section>
        <footer><span>🦉</span> Har kuni ozgina o‘rgan — katta natijaga erish! <button onClick={resetProgress}>Qayta boshlash</button></footer>
      </main>}

      {screen === 'learn' && <main className="lesson-page">
        <div className="lesson-head">
          <button className="back-button" onClick={goHome}>← <span>Xaritaga</span></button>
          <div><span>{currentLevel.icon} {levelIndex+1}-bosqich • {currentLevel.name}</span><div className="lesson-track"><i style={{width:`${learnedInLevel*10}%`}}/></div></div>
          <strong>{learnedInLevel}/10 o‘rganildi</strong>
        </div>
        <section className="word-stage">
          <div className="word-position">SO‘Z {wordIndex+1} / 10</div>
          <article className={`word-card ${playing ? 'speaking' : ''} ${wordTransition ? 'word-leaving' : 'word-entering'}`} style={{'--level': currentLevel.color} as React.CSSProperties}>
            {wordTransition && <div className="learn-burst" aria-hidden="true"><span>✓</span><i>★</i><i>★</i><i>★</i></div>}
            <div className="corner-star">+1 ⭐</div>
            <div className="word-picture" aria-hidden="true"><span>{currentLevel.words[wordIndex].icon}</span><i/></div>
            <h1>{currentLevel.words[wordIndex].en}</h1>
            <p>{currentLevel.words[wordIndex].uz}</p>
            <div className="audio-actions">
              <button className="listen" onClick={() => speak(currentLevel.words[wordIndex].en)} aria-label={`${currentLevel.words[wordIndex].en} so‘zini eshitish`}>
                <span>{playing ? '◖))' : '🔊'}</span><b>{playing ? 'Eshitilyapti...' : 'Eshitish'}</b>
              </button>
              <button onClick={() => speak(currentLevel.words[wordIndex].en)}><span>↻</span><b>Qayta aytish</b></button>
              <button onClick={() => speak(currentLevel.words[wordIndex].en, true)}><span>🐢</span><b>Sekin aytish</b></button>
            </div>
            <button className="learn-button" onClick={markLearned} disabled={wordTransition}>
              <span className="check-icon">✓</span> {wordTransition ? 'Barakalla!' : 'O‘rgandim!'}
            </button>
            <small className="auto-next-note">{wordIndex < 9 ? 'Keyingi so‘z avtomatik ochiladi' : 'So‘ng quizga o‘tamiz'}</small>
          </article>
          <div className="word-navigation">
            <button onClick={() => setWordIndex(i => Math.max(0,i-1))} disabled={wordIndex === 0}>← Oldingi</button>
            <div>{currentLevel.words.map((_,i) => <button key={i} className={`${i===wordIndex?'current':''} ${progress.learned[keyFor(levelIndex,i)]?'learned':''}`} onClick={() => setWordIndex(i)} aria-label={`${i+1}-so‘z`}>{i+1}</button>)}</div>
            <span aria-hidden="true"/>
          </div>
        </section>
      </main>}

      {screen === 'lessonDone' && <main className="lesson-complete-page">
        <Confetti/>
        <section className="lesson-complete-card">
          <div className="complete-mascot" aria-hidden="true">🦉</div>
          <span className="complete-label">10 / 10 SO‘Z O‘RGANILDI</span>
          <h1>🎉 Ajoyib!</h1>
          <p>Siz 10 ta so‘zni o‘rgandingiz!</p>
          <div className="complete-level-icon">{currentLevel.icon}</div>
          <div className="ten-stars" aria-label="10 ta so‘z o‘rganildi">{currentLevel.words.map((_, i) => <span key={i}>★</span>)}</div>
          <button className="start-quiz-button" onClick={startQuiz}><span>🎮</span><div><b>Level Quizni boshlash</b><small>10 ta qiziqarli savol</small></div><i>→</i></button>
          <button className="review-link" onClick={() => { setWordIndex(0); setScreen('learn') }}>↻ So‘zlarni yana ko‘rish</button>
        </section>
      </main>}

      {screen === 'quiz' && <QuizScreen level={currentLevel} index={quizAt} score={quizScore} options={quizOptions} answer={answer} onAnswer={chooseAnswer} onNext={nextQuestion} onSpeak={speak} onExit={() => setScreen('learn')}/>}

      {screen === 'result' && <main className="result-page">
        {lastResult.passed && <Confetti/>}
        <section className="result-card">
          <Mascot text={lastResult.passed ? 'Sen uddalading!' : 'Yana birga mashq qilamiz!'} />
          <div className="result-icon">{lastResult.passed ? '🏆' : '🌈'}</div>
          <span>{lastResult.passed ? 'BOSQICH YAKUNLANDI' : 'YAXSHI URINISH'}</span>
          <h1>{lastResult.passed ? 'Ajoyib!' : 'Deyarli tayyor!'}</h1>
          <p>{lastResult.passed ? `${levelIndex+1}-bosqichni muvaffaqiyatli tugatdingiz!` : 'Bir oz takrorlasak, albatta uddalaysiz!'}</p>
          <div className="score-ring"><b>{lastResult.score}</b><span>/10</span></div>
          <div className="result-stars">{[0,1,2].map(i => <span key={i} className={lastResult.passed && i < (lastResult.score===10?3:lastResult.score===9?2:1) ? 'on':''}>★</span>)}</div>
          {lastResult.passed && levelIndex < 9 && <div className="unlock-note">🔓 {levelIndex+2}-bosqich ochildi!</div>}
          <div className="result-actions">
            <button className="secondary-button" onClick={startQuiz}>↻ Quizni takrorlash</button>
            <button className="primary-button" onClick={() => lastResult.passed && levelIndex < 9 ? openLevel(levelIndex+1) : goHome()}>{lastResult.passed ? (levelIndex < 9 ? 'Keyingi bosqich →' : 'Xaritaga') : 'So‘zlarni takrorlash →'}</button>
          </div>
        </section>
      </main>}

      {screen === 'champion' && <main className="champion-page">
        <Confetti/>
        <section className="certificate">
          <span className="crown">👑</span><div className="ribbon">MAXSUS SERTIFIKAT</div>
          <h1>100 SO‘Z<br/><em>CHEMPIONI</em></h1>
          <p>Tabriklaymiz!</p><strong>Siz 100 ta inglizcha so‘zni o‘rgandingiz!</strong>
          <div className="champion-stats"><span><b>100/100</b>So‘z</span><span><b>10/10</b>Bosqich</span><span><b>⭐ {stars}</b>Yulduz</span></div>
          <div className="result-actions"><button className="secondary-button" onClick={() => setScreen('review')}>📚 100 so‘zni ko‘rish</button><button className="primary-button" onClick={resetProgress}>↻ Qayta o‘ynash</button></div>
        </section>
      </main>}

      {screen === 'review' && <main className="review-page">
        <div className="lesson-head"><button className="back-button" onClick={goHome}>← Xaritaga</button><h1>Barcha 100 ta so‘z</h1><strong>👑 Chempion</strong></div>
        <div className="review-grid">{levels.flatMap((l,li) => l.words.map((w,wi) => <button key={`${li}-${wi}`} onClick={() => speak(w.en)}><span>{w.icon}</span><div><b>{w.en}</b><small>{w.uz}</small></div><i>🔊</i></button>))}</div>
      </main>}
    </div>
  )
}

function QuizScreen({level,index,score,options,answer,onAnswer,onNext,onSpeak,onExit}:{level:Level,index:number,score:number,options:Word[],answer:string|null,onAnswer:(w:Word)=>void,onNext:()=>void,onSpeak:(s:string)=>void,onExit:()=>void}) {
  const type = index % 3
  const correct = level.words[index]
  return <main className="quiz-page">
    <div className="quiz-head"><button className="back-button" onClick={onExit}>× <span>Quizdan chiqish</span></button><div><span>SAVOL {index+1} / 10</span><div className="quiz-track"><i style={{width:`${(index+1)*10}%`}}/></div></div><strong>⭐ {score}</strong></div>
    <section className="quiz-card">
      <div className="quiz-type">{type===0?'🔊 ESHIT VA TANLA':type===1?'🇬🇧 TARJIMANI TOP':'🖼️ RASMNI TOP'}</div>
      <h1>{type===0?'Qaysi so‘zni eshitdingiz?':type===1?'Bu so‘zning ma’nosi nima?':'Rasmda nima bor?'}</h1>
      {type===0 && <button className="quiz-speaker" onClick={() => onSpeak(correct.en)}><span>🔊</span>Eshitish</button>}
      {type===1 && <div className="quiz-prompt word">{correct.en}</div>}
      {type===2 && <div className="quiz-prompt picture">{correct.icon}</div>}
      <div className="option-grid">{options.map((w, optionIndex) => {
        const selected = answer === w.en
        const isCorrect = w.en === correct.en
        const className = answer ? isCorrect ? 'correct' : selected ? 'wrong' : 'muted' : ''
        return <button key={w.en} className={className} onClick={() => onAnswer(w)} disabled={!!answer}>
          <span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span>
          <b>{type===1?w.uz:w.en}</b>
          {answer && isCorrect && <i aria-label="To‘g‘ri javob">✓</i>}
          {selected && !isCorrect && <i aria-label="Noto‘g‘ri javob">×</i>}
        </button>
      })}</div>
      {answer && <div className={`answer-feedback ${answer===correct.en?'good':'gentle'}`} role="status">
        <span>{answer===correct.en?'🎉':'😊'}</span><div><b>{answer===correct.en?'Barakalla! To‘g‘ri javob!':'Yaxshi urinish!'}</b><small>{answer===correct.en?'Ajoyib davom etyapsiz!':`To‘g‘ri javob: ${correct.en} — ${correct.uz}`}</small></div>
        <button onClick={onNext}>{index===9?'Natijani ko‘rish':'Davom etish'} →</button>
      </div>}
    </section>
  </main>
}

export default App
