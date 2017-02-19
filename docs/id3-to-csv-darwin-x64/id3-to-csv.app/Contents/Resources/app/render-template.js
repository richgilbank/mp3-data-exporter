const Handlebars = require('handlebars')

let template
const container = document.getElementById('Container')

const init = new Promise((resolve, reject) => {
  fs.readFile('index.hbs', 'utf-8', (err, source) => {

    Handlebars.registerHelper('ifRoute', function(arg1, options) {
      if(arg1 === options.data.root.route)
        return options.fn(this)
      return options.inverse(this)
    })

    template = Handlebars.compile(source)
    resolve()
  })
})

function render(data) {
  init.then(() => {
    const renderedTemplate = template(data)
    container.innerHTML = renderedTemplate
  })
}

module.exports = render
