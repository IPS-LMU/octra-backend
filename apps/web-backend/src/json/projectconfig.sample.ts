export const DefaultProjectConfig = {
  'version': '1.1.0',
  'logging': {
    'forced': true
  },
  'navigation': {
    'export': true,
    'interfaces': true,
    'help_url': 'https://www.phonetik.uni-muenchen.de/apps/octra/manual/'
  },
  'responsive': {
    'enabled': true,
    'fixedwidth': 1200
  },
  'agreement': {
    'enabled': false,
    'text': {
      'de': '<p>Ich erkläre, dass ich die Probandeninformation zur Studie <b>\'Optimale Webbasierte Transkription langer Audiodateien\'</b> und diese Einverständniserklärung zur Studienteilnahme erhalten habe.</p><ul><li>Ich wurde für mich ausreichend mündlich und/oder schriftlich über die wissenschaftliche Untersuchunginformiert.</li><li>Ich erkläre mich bereit, dass ihm Rahmen der Studie Daten über mein Anwenderverhalten gesammelt unddiese anonymisiert aufgezeichnet werden. Es wird gewährleistet, dass meine personenbezogenen Daten nichtan Dritte außerhalb der LMU weitergegeben werden. In anonymisierter Form dürfen die Daten fürwissenschaftliche Untersuchungen, Publikationen und in der Lehre verwendet werden. Meine persönlichenDaten unterliegen dem Datenschutzgesetz.</li><li>Ich weiß, dass ich jederzeit meine Einverständniserklärung, ohne Angabe von Gründen, widerrufen kann,ohne dass dies für mich nachteilige Folgen hat.</li><li>Mit der vorstehend geschilderten Vorgehensweise bin ich einverstanden und bestätige dies mit dem Klick auf Akzeptieren\'</li></ul>'
    }
  },
  'plugins': {
    'pdfexport': {
      'url': 'https://www.phonetik.uni-muenchen.de/apps/octra/pdfconverter/'
    }
  },
  'languages': [
    'de',
    'en'
  ],
  'interfaces': [
    'Dictaphone Editor',
    'Linear Editor',
    '2D-Editor',
    'TRN-Editor'
  ],
  'feedback_form': [],
  'octra': {
    'validationEnabled': true,
    'sendValidatedTranscriptionOnly': false,
    'showOverviewIfTranscriptNotValid': true,
    'theme': 'shortAudioFiles'
  },
  'guidelines': {
    'showExampleNumbers': false,
    'showExampleHeader': false
  }
}
