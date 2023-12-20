from flask import Flask, jsonify, request
from nltk.sentiment.vader import SentimentIntensityAnalyzer

#to run: flask --app sentiment run
#to run with dd: DD_SERVICE="sentiment-analysis" DD_ENV="dev" DD_LOGS_INJECTION=true DD_PROFILING_ENABLED=true DD_APPSEC_ENABLED=true ddtrace-run flask --app sentiment run
"""
to test api:
curl -X GET -H "Content-Type: application/json" -d '{
"sentence": "smart and lazy"
}' localhost:5000/analyse
"""

app = Flask(__name__)



@app.route("/analyse", methods=['GET','POST'])
def analyse():
    data = request.get_json()
    sentence = data['sentence']
    sid = SentimentIntensityAnalyzer()
    print(sentence)
    ss = sid.polarity_scores(sentence)
    #for k in sorted(ss):
    #  print('{0}: {1}, '.format(k, ss[k]), end='')
    print(ss)
    score = {}
    score['final_score'] = ss['compound']
    if ss['pos'] > 0.4 or ss['neg'] > 0.4:
        score['result'] = 'pos'
    else:
        score['result'] = 'neg'
    return jsonify(score)
