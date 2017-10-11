const {cleanWhitespace} = require('./general')

describe('cleanWhitespace', () => {
  test('Should combine adjacent whitespace', () => {
    expect(cleanWhitespace('This     will   be     cleaned')).toBe('This will be cleaned')
  })
  test('Should replace whitespace with spaces', () => {
    expect(cleanWhitespace('This\t\twill\nbe\fcleaned')).toBe('This will be cleaned')
  })
  test('Should not change characters or capitalization', () => {
    expect(cleanWhitespace('This   wîll be   clëaned?')).toBe('This wîll be clëaned?')
  })
})