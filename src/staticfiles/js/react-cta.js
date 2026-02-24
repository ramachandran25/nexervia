(function () {
  const mountNode = document.getElementById('react-cta-root');
  if (!mountNode || !window.React || !window.ReactDOM) {
    return;
  }

  const { createElement: h, useState } = window.React;

  function ReactCtaWidget() {
    const [selectedPlan, setSelectedPlan] = useState('Starter');
    const plans = ['Starter', 'Growth', 'Scale'];

    return h('section', { className: 'max-w-4xl mx-auto px-6 pb-16' }, [
      h('div', { className: 'rounded-2xl border border-gray-200 bg-white p-8 shadow-sm' }, [
        h('p', { className: 'text-sm font-semibold uppercase tracking-wide text-indigo-600' }, 'Now powered by React'),
        h('h2', { className: 'mt-2 text-2xl font-bold text-gray-900' }, 'Interactive plan preview'),
        h(
          'p',
          { className: 'mt-3 text-gray-600' },
          'This widget is rendered by React and gives visitors a quick way to preview your recommended subscription tier.'
        ),
        h('div', { className: 'mt-6 flex flex-wrap gap-3' },
          plans.map((plan) =>
            h(
              'button',
              {
                key: plan,
                type: 'button',
                onClick: () => setSelectedPlan(plan),
                className:
                  'rounded-lg border px-4 py-2 text-sm font-medium transition ' +
                  (selectedPlan === plan
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-700'),
              },
              plan
            )
          )
        ),
        h('p', { className: 'mt-5 text-sm text-gray-700' }, [
          'Recommended starting point: ',
          h('span', { className: 'font-semibold text-indigo-700' }, selectedPlan),
        ]),
      ]),
    ]);
  }

  const app = window.ReactDOM.createRoot(mountNode);
  app.render(h(ReactCtaWidget));
})();
