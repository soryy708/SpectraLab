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
    const [baseMeasurement, setBaseMeasurement] = useState('');

    // Get all file paths
    const getFilePaths = (filesArray: Array<string>) => {
        let paths: Array<string> = []
        filesArray.forEach(file => {
            let fullPathMeasurementFile = measurementsPath + '\\' + file;
            paths.push(fullPathMeasurementFile);
        })
        return paths;
    }

    // add column of measurements to the matrix
    const addMeasurementsToMatrix = () => {

    }

    async function loadMeaurementsFiles() {
        let measurementFiles = await getFilePaths(files);
        console.log(measurementFiles);

        for (const file of measurementFiles) {
            await fs.readFile(file, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // Two dimentional vector - [waveLength, waveIntensity]
                let measuresVector: string[][] = data.split('\n').map(measure => measure.trim().split(/\s+/));
                console.log(measuresVector);

                // 1. Is it a base measurement file?
                // 2. Is it in the desiarble range?
            });
        }
    }


    return <div className="page">
        <div className="formElement">
            <label className="label">Measurements directory</label>
            <ButtonedInput
                type="text"
                value={measurementsPath}
                onClick={async () => {
                    const { canceled, filePaths } = await electron.ipcRenderer.invoke('showOpenDialog', {
                        properties: ['openDirectory'],
                    });
                    if (!canceled) {
                        setMeasurementsPath(filePaths[0]);
                    }
                    const filePathsInDir = await util.promisify(fs.readdir)(filePaths[0], { withFileTypes: true });
                    setFiles(filePathsInDir.filter(dirent => dirent.isFile()).map(dirent => dirent.name));
                    // If we dont set it now, it will be an empty string
                    setBaseMeasurement(filePathsInDir[0].name)
                }}
                buttonType='button'
                buttonText='Browse'
            />
        </div>

        <div className="formElement">
            <label className="label">Normalize?</label>
            <input className="input" type="checkbox" checked={normalize} onChange={e => setNormalize(e.target.checked)} />
        </div>

        <div className="formElement">
            <label className="label">Base measurement</label>
            <select disabled={files.length === 0} onChange={e => setBaseMeasurement(e.target.value)}>
                {files.map(file => <option key={file} value={file}>{path.basename(file)}</option>)}
            </select>
        </div>

        <div style={{ textAlign: 'center' }}>
            <Button primary text="Continue" disabled={files.length === 0} onClick={loadMeaurementsFiles} />
        </div>
    </div>;
};

export default LoadPage;
