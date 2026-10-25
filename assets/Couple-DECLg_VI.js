import {
  invitation as W
} from "../src/settings.js";
import {
  n as e
} from "./rolldown-runtime-Bh1tDfsg.js";
import {
  c as t,
  o as n
} from "./react-CC4f5wG5.js";
import {
  r
} from "./gsap-BL2wBkID.js";
var i = e(t(), 1),
  a = {
    coupleSection: `_coupleSection_zlpx8_1`,
    container: `_container_zlpx8_9`,
    animateBlock: `_animateBlock_zlpx8_37`,
    ekOnkar: `_ekOnkar_zlpx8_42`,
    shabad: `_shabad_zlpx8_49`,
    heading: `_heading_zlpx8_58`,
    paragraph: `_paragraph_zlpx8_68`,
    name: `_name_zlpx8_80`,
    relationLabel: `_relationLabel_zlpx8_91`,
    parentsName: `_parentsName_zlpx8_101`,
    withText: `_withText_zlpx8_109`
  },
  o = n(),
  s = (0, i.memo)(() => {
    let e = (0, i.useRef)(null);
    return (0, i.useEffect)(() => {
      let t = r.context(() => {
        let t = r.utils.toArray(`.${a.animateBlock}`);
        r.fromTo(t, {
          opacity: 0,
          y: 40,
          filter: `blur(8px)`
        }, {
          opacity: 1,
          y: 0,
          filter: `blur(0px)`,
          duration: 1.2,
          stagger: .15,
          ease: `power2.out`,
          scrollTrigger: {
            trigger: e.current,
            start: `top 80%`
          }
        })
      }, e);
      return () => t.revert()
    }, []), (0, o.jsx)(`section`, {
      className: a.coupleSection,
      ref: e,
      children: (0, o.jsxs)(`div`, {
        className: a.container,
        children: [(0, o.jsx)(`div`, {
          className: `${a.ekOnkar} ${a.animateBlock}`,
          children: W.prayer
        }), (0, o.jsxs)(`div`, {
          className: `${a.shabad} ${a.animateBlock}`,
          children: [W.prayerLines[0], (0, o.jsx)(`br`, {}), W.prayerLines[1]]
        }), (0, o.jsx)(`h2`, {
          className: `${a.heading} ${a.animateBlock}`,
          children: W.inviteTitle
        }), (0, o.jsxs)(`p`, {
          className: `${a.paragraph} ${a.animateBlock}`,
          children: [W.invitationLines[0], (0, o.jsx)(`br`, {}), W.invitationLines[1], (0, o.jsx)(`br`, {}), W.invitationLines[2]]
        }), (0, o.jsxs)(`div`, {
          className: a.animateBlock,
          children: [(0, o.jsx)(`h1`, {
            className: a.name,
            children: W.bride
          }), (0, o.jsx)(`p`, {
            className: a.relationLabel,
            children: W.brideRelation
          }), (0, o.jsx)(`p`, {
            className: a.parentsName,
            children: W.brideParents
          })]
        }), (0, o.jsx)(`div`, {
          className: `${a.withText} ${a.animateBlock}`,
          children: W.withText
        }), (0, o.jsxs)(`div`, {
          className: a.animateBlock,
          children: [(0, o.jsx)(`h1`, {
            className: a.name,
            children: W.groom
          }), (0, o.jsx)(`p`, {
            className: a.relationLabel,
            children: W.groomRelation
          }), (0, o.jsx)(`p`, {
            className: a.parentsName,
            children: W.groomParents
          })]
        })]
      })
    })
  });
export {
  s as
  default
};
