import {
  invitation as W
} from "../src/settings.js";
import {
  n as interop
} from "./rolldown-runtime-Bh1tDfsg.js";
import {
  c as reactModule
} from "./react-CC4f5wG5.js";
import {
  r as gsap
} from "./gsap-BL2wBkID.js";
const React = interop(reactModule(), 1);
const h = React.createElement;
export default function FamilyDetails() {
  const section = React.useRef(null);
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('._familyCard_1tjuu_26', {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: .2,
        scrollTrigger: {
          trigger: section.current,
          start: 'top 80%'
        }
      });
    }, section);
    return () => ctx.revert();
  }, []);
  return h('section', {
      className: '_familySection_1tjuu_1',
      ref: section
    },
    h('h2', {
      className: '_title_1tjuu_9'
    }, W.familyTitle),
    h('div', {
        className: '_container_1tjuu_18'
      },
      h('div', {
          className: '_familyCard_1tjuu_26'
        },
        ...W.family.map((group, index) => h('div', {
            key: index,
            className: '_relationGroup_1tjuu_61',
            style: group.highlight ? {
              padding: '26px 15px',
              border: '1px solid #c9a24a',
              borderRadius: '18px',
              background: '#fff7e7'
            } : undefined
          },
          h('h4', null, group.label),
          h('p', {
            style: group.highlight ? {
              fontSize: 'clamp(1.6rem,5vw,2.3rem)',
              fontWeight: 700,
              color: '#8f6a22',
              marginTop: '10px'
            } : undefined
          }, group.names),
          group.highlight && h('p', {
            style: {
              fontStyle: 'italic',
              fontSize: '1.1rem',
              marginTop: '12px'
            }
          }, W.familyQuote)
        ))
      )
    )
  );
}
