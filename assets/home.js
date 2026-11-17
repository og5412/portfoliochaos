// Generated from assets/home.jsx by tools/build-home.cjs.
const {
  useState,
  useEffect,
  useRef
} = React;
const IconArrowDown = ({
  size = 24,
  className
}) => React.createElement("svg", {
  width: size,
  height: size,
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M12 5v14"
}), React.createElement("path", {
  d: "m19 12-7 7-7-7"
}));
const IconArrowRight = ({
  size = 24,
  className
}) => React.createElement("svg", {
  width: size,
  height: size,
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M5 12h14"
}), React.createElement("path", {
  d: "m12 5 7 7-7 7"
}));
const IconMail = ({
  size = 24,
  className
}) => React.createElement("svg", {
  width: size,
  height: size,
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("rect", {
  width: "20",
  height: "16",
  x: "2",
  y: "4",
  rx: "2"
}), React.createElement("path", {
  d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
}));
const IconLinkedin = ({
  size = 24,
  className
}) => React.createElement("svg", {
  width: size,
  height: size,
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
}), React.createElement("rect", {
  width: "4",
  height: "12",
  x: "2",
  y: "9"
}), React.createElement("circle", {
  cx: "4",
  cy: "4",
  r: "2"
}));
const IconInstagram = ({
  size = 24,
  className
}) => React.createElement("svg", {
  width: size,
  height: size,
  className: className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("rect", {
  width: "20",
  height: "20",
  x: "2",
  y: "2",
  rx: "5",
  ry: "5"
}), React.createElement("path", {
  d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
}), React.createElement("line", {
  x1: "17.5",
  x2: "17.51",
  y1: "6.5",
  y2: "6.5"
}));
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
};
const TextScramble = ({
  text,
  className,
  trigger
}) => {
  const [display, setDisplay] = useState(text);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(text.split("").map((letter, index) => {
        if (index < iteration) return text[index];
        return randomChar();
      }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger, reducedMotion]);
  return React.createElement("span", {
    className: className
  }, React.createElement("span", {
    "aria-hidden": "true"
  }, display), React.createElement("span", {
    className: "sr-only"
  }, text));
};
const ChaosSphere = () => {
  const videoRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(reducedMotion);
  useEffect(() => {
    setPaused(reducedMotion);
  }, [reducedMotion]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();else video.play().catch(() => setPaused(true));
  }, [paused]);
  return React.createElement("div", {
    className: "w-full h-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity duration-700"
  }, React.createElement("video", {
    ref: videoRef,
    src: "./assets/chaos-web.mp4",
    poster: "./assets/chaos-poster.jpg",
    autoPlay: !reducedMotion,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "metadata",
    "aria-hidden": "true",
    className: "w-full h-full object-contain mix-blend-screen"
  }), React.createElement("button", {
    type: "button",
    onClick: () => setPaused(!paused),
    "aria-label": paused ? 'Play background animation' : 'Pause background animation',
    className: "absolute bottom-10 left-6 md:left-12 z-20 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white py-3"
  }, paused ? 'Play motion' : 'Pause motion'));
};
const Portfolio = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight || 0;
      setScrollProgress(scroll);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    const scrollToHash = (initial = false) => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          let id;
          try {
            id = decodeURIComponent(window.location.hash.slice(1));
          } catch {
            return;
          }
          const target = id && document.getElementById(id);
          if (!target) return;
          const page = document.documentElement;
          const previousBehavior = page.style.scrollBehavior;
          if (initial) page.style.scrollBehavior = 'auto';
          target.scrollIntoView({
            behavior: initial || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
          });
          if (initial) page.style.scrollBehavior = previousBehavior;
        });
      });
    };
    const onHashChange = () => scrollToHash(false);
    scrollToHash(true);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);
  const bgColor = 'bg-[#000000]';
  const textColor = 'text-zinc-100';
  const accentColor = 'text-zinc-500';
  const cardBg = 'bg-zinc-900/30';
  const navBg = 'bg-black/0';
  const projects = [{
    id: 1,
    slug: 'fruit-of-their-love',
    title: "Fruit of their love",
    desc: "An interactive installation exploring how early family environments leave invisible marks. A suspended cube reacts to audience proximity, its surface gradually “damaged” through projection, sensory input, and symbolic material textures.",
    type: "Interactive Installation, Sensor-Driven Art",
    img: "./p1.jpg"
  }, {
    id: 2,
    slug: 'the-hanging-of-technology',
    title: "The hanging of technology",
    desc: "A dark-room installation confronting data exposure and digital surveillance. Six suspended figures display fragments of algorithm-derived “inner monologues,” positioning the audience as both witness and observer within an uneasy technological gaze.",
    type: "Interactive Installation, Critical Design",
    img: "./p2.jpg"
  }, {
    id: 3,
    slug: 'whisperfield',
    title: "Whisperfield",
    desc: "An AI-driven ambient landscape built inside the Cube. Whisperfield shifts with audience movement and sensory input, creating a slow, responsive environment designed to support focus, grounding, and neurodiverse comfort.",
    type: "Multisensory Space, Neurodiverse Design",
    img: "./p3.jpg"
  }, {
    id: 4,
    slug: 'colab',
    title: "CoLab",
    desc: "A course-based team-matching platform that helps university students form compatible groups through skill profiles, shared goals, and structured collaboration. CoLab streamlines lecture–tutorial interaction with focused discussion, resource sharing, and simple project tracking.",
    type: "EdTech Product, UX & Interaction Design",
    img: "./p4.jpg"
  }, {
    id: 5,
    slug: 'the-foodark-system',
    title: "The Foodark System",
    desc: "A service design system that redirects unsold fresh food to low-income and refugee families through verified retailers, smart distribution points, and a dual-sided mobile platform. Foodark reduces waste while improving access, dignity, and community support.",
    type: "Service Design, Sustainability",
    img: "./p5.jpg"
  }, {
    id: 6,
    slug: 'city2surf-app',
    title: "City2Surf App",
    desc: "A post-race data and sharing app for the City2Surf virtual run. It visualizes pace, heart rate, and race insights while offering an AI-powered poster generator to help runners celebrate and share their results.",
    type: "Interaction Design, Fitness App",
    img: "./p6.jpg"
  }, {
    id: 7,
    slug: 'echo-frame',
    title: "Echo Frame",
    desc: "A browser extension that converts real-time audio into sign-language animations, making video content accessible for deaf and hard-of-hearing viewers without relying on captions.",
    type: "Accessibility, Assistive Technology",
    img: null
  }, {
    id: 8,
    slug: 'still-here',
    title: "Still Here",
    desc: "A private digital space for messages that should only be delivered when you’re no longer able to send them yourself. The system uses inactivity patterns, trusted contacts, and timed verification to release your final messages safely and respectfully.",
    type: "Digital Legacy, Emotional Technology",
    img: null
  }];
  return React.createElement("div", {
    id: "top",
    className: `min-h-[300vh] w-full ${bgColor} ${textColor} transition-colors duration-700 font-sans selection:bg-white selection:text-black`
  }, React.createElement("nav", {
    "aria-label": "Main navigation",
    className: `fixed top-0 left-0 w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center z-50 mix-blend-difference ${navBg} backdrop-blur-sm transition-all duration-500`
  }, React.createElement("a", {
    href: "#top",
    "aria-label": "Jiawei Liu, back to top",
    className: "flex flex-col relative z-10"
  }, React.createElement("span", {
    className: "text-lg md:text-xl font-bold tracking-[0.2em] uppercase text-white"
  }, "Jiawei Liu"), React.createElement("span", {
    className: "text-[10px] md:text-xs font-mono opacity-60 tracking-wider text-white"
  }, "Design & Chaos")), React.createElement("div", {
    className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex gap-12"
  }, ['Identity', 'Projects', 'Traces', 'Contact'].map(item => React.createElement("a", {
    key: item,
    href: `#${item.toLowerCase()}`,
    className: "relative group py-1"
  }, React.createElement("span", {
    className: "text-sm font-mono tracking-[0.15em] uppercase text-white opacity-80 group-hover:opacity-100 transition-opacity"
  }, item), React.createElement("span", {
    className: "absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"
  })))), React.createElement("div", {
    className: "lg:hidden flex gap-5 text-[10px] font-mono uppercase tracking-wider text-white"
  }, React.createElement("a", {
    href: "#projects",
    className: "py-2"
  }, "Work"), React.createElement("a", {
    href: "#contact",
    className: "py-2"
  }, "Contact")), React.createElement("div", {
    className: "w-8 hidden lg:block"
  })), React.createElement("main", null, React.createElement("section", {
    className: "h-screen w-full relative flex flex-col items-center justify-center overflow-hidden"
  }, React.createElement("h1", {
    className: "sr-only"
  }, "Jiawei Liu \u2014 Design & Chaos"), React.createElement("div", {
    className: "relative z-0 w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out",
    style: {
      transform: reducedMotion ? 'none' : `scale(${1 + scrollProgress * 0.3})`
    }
  }, React.createElement(ChaosSphere, null)), React.createElement("div", {
    className: `absolute bottom-[20%] left-0 w-full z-10 text-center transition-all duration-700 ${scrollProgress > 0.05 ? 'opacity-0 translate-y-10' : 'opacity-100'}`
  }, React.createElement("p", {
    className: "text-sm md:text-base font-serif italic tracking-widest text-zinc-400"
  }, "Structure comes from chaos")), React.createElement("a", {
    href: "#identity",
    "aria-label": "Explore my work and background",
    className: `absolute bottom-12 animate-pulse transition-opacity duration-500 ${scrollProgress > 0.1 ? 'opacity-0' : 'opacity-40'}`
  }, React.createElement(IconArrowDown, {
    size: 24
  }))), React.createElement("section", {
    id: "identity",
    className: "relative z-10 w-full min-h-screen flex flex-col justify-center py-24 px-6 md:px-24"
  }, React.createElement("div", {
    className: "max-w-6xl mx-auto w-full"
  }, React.createElement("div", {
    className: "flex items-center gap-4 mb-12 opacity-50"
  }, React.createElement("span", {
    className: "text-xs font-mono uppercase tracking-widest"
  }, "01 / Identity"), React.createElement("div", {
    className: "h-[1px] w-12 bg-current"
  })), React.createElement("div", {
    className: "mb-24"
  }, React.createElement("h2", {
    className: "text-3xl md:text-5xl font-light leading-snug max-w-4xl"
  }, "I am ", React.createElement(TextScramble, {
    text: "Jiawei Liu",
    className: "font-bold",
    trigger: scrollProgress > 0.15
  }), "."), React.createElement("p", {
    className: "mt-6 text-lg md:text-2xl font-light opacity-80 leading-relaxed max-w-4xl"
  }, "Designer and Developer working across digital product, spatial experience, interaction systems, and generative aesthetics. I explore how ", React.createElement("span", {
    className: "italic font-serif"
  }, "order emerges from instability"), ", translating intuition, data, and sensing technologies into immersive installations and digital products.")), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-current/10 pt-12"
  }, React.createElement("div", null, React.createElement("h3", {
    className: "text-xs font-mono uppercase tracking-widest mb-6 opacity-50"
  }, "Current Focus"), React.createElement("div", {
    className: "mb-2"
  }, React.createElement("span", {
    className: "text-xl md:text-2xl font-medium block"
  }, "Chaos Studio")), React.createElement("p", {
    className: "text-sm opacity-80 leading-relaxed max-w-xs"
  }, "Multisensory installation design, interactive environments, digital product, UI/UX")), React.createElement("div", null, React.createElement("h3", {
    className: "text-xs font-mono uppercase tracking-widest mb-6 opacity-50"
  }, "Academic Path"), React.createElement("div", {
    className: "mb-8 group"
  }, React.createElement("div", {
    className: "flex items-baseline gap-2 mb-1"
  }, React.createElement("span", {
    className: "text-xs font-mono opacity-50"
  }, "2024-2026")), React.createElement("p", {
    className: "font-medium text-lg"
  }, "Master of Interaction Design"), React.createElement("p", {
    className: `${accentColor} text-sm`
  }, "University of Sydney")), React.createElement("div", {
    className: "group"
  }, React.createElement("div", {
    className: "flex items-baseline gap-2 mb-1"
  }, React.createElement("span", {
    className: "text-xs font-mono opacity-50"
  }, "2017-2021")), React.createElement("p", {
    className: "font-medium text-lg"
  }, "Visual Communication Design"), React.createElement("p", {
    className: `${accentColor} text-sm`
  }, "Shandong University of Science and Technology"))), React.createElement("div", null, React.createElement("h3", {
    className: "text-xs font-mono uppercase tracking-widest mb-6 opacity-50"
  }, "Tech Stack"), React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, ['Cinema 4D + Octane', 'Adobe Suite', 'Figma', 'Unreal Engine 5', 'TouchDesigner', 'AIGC Creator'].map(tech => React.createElement("span", {
    key: tech,
    className: "px-3 py-1.5 border border-current/20 text-xs uppercase tracking-wide hover:bg-white hover:text-black transition-colors cursor-default"
  }, tech))))))), React.createElement("section", {
    id: "projects",
    className: "relative z-10 w-full min-h-screen py-24 px-6 md:px-24 border-t border-current/10 bg-gradient-to-b from-transparent to-current/5"
  }, React.createElement("div", {
    className: "max-w-7xl mx-auto w-full"
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-24"
  }, React.createElement("div", {
    className: "flex items-center gap-4 opacity-50"
  }, React.createElement("h2", {
    className: "text-xs font-mono uppercase tracking-widest"
  }, "02 / Projects"), React.createElement("div", {
    className: "h-[1px] w-12 bg-current"
  })), React.createElement("span", {
    className: "text-xs font-mono uppercase opacity-30"
  }, "Selected Works")), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24"
  }, projects.map(project => React.createElement("a", {
    key: project.id,
    href: `./projects/${project.slug}.html`,
    className: "group flex flex-col gap-6",
    "aria-label": `${project.title} — ${project.img ? 'view case study' : 'view concept'}`
  }, React.createElement("div", {
    className: `w-full aspect-[16/9] overflow-hidden relative ${!project.img ? 'border border-dashed border-zinc-700' : 'bg-zinc-800'}`
  }, project.img ? React.createElement("div", {
    className: "w-full h-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors duration-500 overflow-hidden"
  }, React.createElement("img", {
    src: project.img,
    alt: project.title,
    width: "1600",
    height: "900",
    loading: "lazy",
    decoding: "async",
    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 hover:opacity-100"
  })) : React.createElement("div", {
    className: "w-full h-full flex items-center justify-center bg-transparent"
  }, React.createElement("span", {
    className: "text-xs font-mono text-zinc-400 uppercase tracking-widest"
  }, "[ Concept in development ]")), React.createElement("div", {
    className: "absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none"
  })), React.createElement("div", {
    className: "flex flex-col gap-3"
  }, React.createElement("h3", {
    className: "text-2xl md:text-3xl font-light tracking-tight group-hover:italic transition-all duration-300"
  }, project.title), React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, project.type.split(',').map((tag, idx) => React.createElement("span", {
    key: idx,
    className: "px-3 py-1 text-xs font-mono border border-zinc-800 rounded-full text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-200 transition-colors"
  }, tag.trim()))), React.createElement("p", {
    className: `text-sm md:text-base leading-loose ${accentColor} mt-2 group-hover:text-zinc-300 transition-colors duration-300`
  }, project.desc), React.createElement("span", {
    className: "mt-3 inline-flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-300"
  }, project.img ? 'View case study' : 'View concept', React.createElement(IconArrowRight, {
    size: 16,
    className: "group-hover:translate-x-1 transition-transform"
  })))))), React.createElement("div", {
    className: "mt-24 flex justify-center"
  }, React.createElement("a", {
    href: "./projects/fruit-of-their-love.html",
    className: "flex items-center gap-3 group opacity-60 hover:opacity-100 transition-opacity"
  }, React.createElement("span", {
    className: "text-xs font-mono tracking-widest uppercase border-b border-transparent group-hover:border-current pb-1 transition-all"
  }, "Enter the installation"), React.createElement(IconArrowRight, {
    size: 16,
    className: "group-hover:translate-x-1 transition-transform"
  }))))), React.createElement("section", {
    id: "traces",
    className: "relative z-10 w-full min-h-[50vh] py-24 px-6 md:px-24 border-t border-current/10"
  }, React.createElement("div", {
    className: "max-w-6xl mx-auto w-full"
  }, React.createElement("div", {
    className: "flex items-center gap-4 mb-16 opacity-50"
  }, React.createElement("h2", {
    className: "text-xs font-mono uppercase tracking-widest"
  }, "03 / Traces"), React.createElement("div", {
    className: "h-[1px] w-12 bg-current"
  })), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
  }, [{
    label: '01 / Material & meaning',
    text: 'How an object can carry the traces of an experience.',
    slug: 'fruit-of-their-love'
  }, {
    label: '02 / Space & sensation',
    text: 'Exploring quieter, responsive environments through Whisperfield.',
    slug: 'whisperfield'
  }, {
    label: '03 / People & systems',
    text: 'Connecting food access, local retailers and community support.',
    slug: 'the-foodark-system'
  }].map(trace => React.createElement("a", {
    key: trace.slug,
    href: `./projects/${trace.slug}.html`,
    className: `min-h-40 border-l border-current/20 pl-6 pr-4 py-6 flex flex-col justify-between gap-6 group hover:border-current transition-colors ${cardBg}`
  }, React.createElement("span", {
    className: "text-xs font-mono text-zinc-400 uppercase tracking-wider"
  }, trace.label), React.createElement("p", {
    className: "text-sm font-light leading-relaxed"
  }, trace.text), React.createElement(IconArrowRight, {
    size: 16,
    className: "opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
  })))), React.createElement("div", {
    className: "flex justify-start"
  }, React.createElement("a", {
    href: "#projects",
    className: "flex items-center gap-2 group opacity-60 hover:opacity-100 transition-opacity"
  }, React.createElement("span", {
    className: "text-xs font-mono tracking-widest uppercase border-b border-transparent group-hover:border-current pb-1 transition-all"
  }, "Explore all projects"), React.createElement(IconArrowRight, {
    size: 14,
    className: "group-hover:translate-x-1 transition-transform"
  }))))), React.createElement("section", {
    id: "contact",
    className: "relative z-10 w-full py-32 px-6 md:px-24 border-t border-current/10 bg-zinc-900/20"
  }, React.createElement("div", {
    className: "max-w-4xl mx-auto text-center flex flex-col items-center"
  }, React.createElement("h2", {
    className: "text-4xl md:text-8xl font-bold mb-8 tracking-tighter"
  }, "LET'S COLLIDE"), React.createElement("p", {
    className: "text-lg md:text-xl font-light opacity-70 mb-12 max-w-xl mx-auto"
  }, "Open for collaborations, commissions, and chaotic conversations."), React.createElement("div", {
    className: "flex flex-wrap justify-center gap-8 md:gap-16 items-center"
  }, React.createElement("a", {
    href: "mailto:1172627363@qq.com",
    className: "flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-all"
  }, React.createElement("div", {
    className: "p-4 border border-current rounded-full group-hover:bg-white group-hover:text-black transition-colors"
  }, React.createElement(IconMail, {
    size: 24
  })), React.createElement("span", {
    className: "text-xs font-mono tracking-widest"
  }, "1172627363@qq.com"))), React.createElement("div", {
    className: "mt-32 w-full flex justify-between items-end text-[10px] md:text-xs font-mono opacity-30 uppercase border-t border-current/10 pt-8"
  }, React.createElement("span", null, "Sydney, Australia"), React.createElement("span", null, "Chaos Studio \xA9 2025 Jiawei Liu"))))));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Portfolio, null));
