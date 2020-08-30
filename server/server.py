# 
# Copyright 2016 Google Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 

from predict import generate_midi
import os
from flask import send_file, request
import pretty_midi
import sys
if sys.version_info.major <= 2:
    from cStringIO import StringIO
else:
    from io import StringIO

from io import BytesIO
import time
import json

from flask import Flask
app = Flask(__name__, static_url_path='', static_folder=os.path.abspath('../static'))


@app.route('/predict', methods=['POST'])
def predict():
    print('predicting.....')
    now = time.time()
    values = json.loads(request.data)
    print('creating midi data', values)
    valuesStr = (''.join(chr(v) for v in values))
    valBytes = BytesIO(bytes(valuesStr, 'latin1'))
    midi_data = pretty_midi.PrettyMIDI(valBytes)
    # print('setting duration')
    # duration = float(request.args.get('duration'))
    print('setting retMidi')
    ret_midi = generate_midi(midi_data)
    return send_file(ret_midi, attachment_filename='return.mid', 
        mimetype='audio/midi', as_attachment=True)


@app.route('/', methods=['GET', 'POST'])
def index():
    return send_file('../static/index.html')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
