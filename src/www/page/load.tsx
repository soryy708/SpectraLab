import fs from 'fs';
import util from 'util';
import path from 'path';
import React, { useState } from 'react';
import electron from 'electron';
import ButtonedInput from '../components/buttonedInput';
import Button from '../components/button';

const LoadPage: React.FunctionComponent = () => {
    const [measurementsPath, setMeasurementsPath] = useState('');
    const [normalize, setNormalize] = useState<boolean>(false);
    const [files, setFiles] = useState<string[]>([]);

    return <div className="page">
        <div className="formElement">
            <label className="label">Measurements directory</label>
            <ButtonedInput
                type="text"
                value={measurementsPath}
                onClick={async () => {
                    const {canceled, filePaths} = await electron.ipcRenderer.invoke('showOpenDialog', {
                        properties: ['openDirectory'],
                    });
                    if (!canceled) {
                        setMeasurementsPath(filePaths[0]);
                    }
                    const filePathsInDir = await util.promisify(fs.readdir)(filePaths[0], { withFileTypes: true });
                    setFiles(filePathsInDir.filter(dirent => dirent.isFile()).map(dirent => dirent.name));
                }}
                buttonType='button'
                buttonText='Browse'
            />
        </div>
        
        <div className="formElement">
            <label className="label">Normalize?</label>
            <input className="input" type="checkbox" checked={normalize} onChange={e => setNormalize(e.target.checked)}/>
        </div>
        
        <div className="formElement">
            <label className="label">Base measurement</label>
            <select disabled={files.length === 0}>
                {files.map(file => <option key={file} value={file}>{path.basename(file)}</option>)}
            </select>
        </div>

        <div style={{textAlign: 'center'}}>
            <Button primary text="Continue" disabled={files.length === 0}/>
        </div>
    </div>;
};

export default LoadPage;
