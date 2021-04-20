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
        const paths: Array<string> = [];
        filesArray.forEach(file => {
            const fullPathMeasurementFile = measurementsPath + '\\' + file;
            paths.push(fullPathMeasurementFile);
        });
        return paths;
    };

    // Read from files measures and create objects
    const getMeasuresObjects = (measurementFiles: Array<string>) => {
        return Promise.all(measurementFiles.map(async file => {
            const data = await fs.promises.readFile(file, 'utf8');
            const vector = data.split('\n').map(measure => {
                const [waveLength, waveIntensity] = measure.trim().split(/\s+/u);
                return { waveLength, waveIntensity };
            });
            return { file, vector };
        }));
    };

    // Set wave lengths in the matrix
    const initWaveLengthColumnInMatrix = (measuresObjects: { file: string, vector: { waveLength: string, waveIntensity: string }[] }[]) => {
        const matrix: number[][] = [];
        for (const measure of measuresObjects[0].vector) {
            matrix.push([Number(measure.waveLength)]);
        }
        return matrix;
    };


    const buildMatrix = (measuresObjects: { file: string, vector: { waveLength: string, waveIntensity: string }[] }[], matrix: number[][]) => {
        for (const measure of measuresObjects) {
            for (let i = 0; i < measure.vector.length; i++) {
                matrix[i].push(Number(measure.vector[i].waveIntensity));
            }
        }
    };

    // Find the reference/base vector that we should subtract every vector from him
    const findBaseVector = (measuresObjects: { file: string, vector: { waveLength: string, waveIntensity: string }[] }[]) => {
        for (const measure of measuresObjects) {
            if (measure.file.endsWith(baseMeasurement)) {
                return JSON.parse(JSON.stringify(measure.vector));
            }
        }
    };

    const buildMatrixWithNormalize = (measuresObjects: { file: string, vector: { waveLength: string, waveIntensity: string }[] }[], matrix: number[][]) => {
        const baseVector = findBaseVector(measuresObjects);
        for (const measure of measuresObjects) {
            if (!measure.file.endsWith(baseMeasurement)) {
                // Substruct the base vector and push to the matrix
                for (let i = 0; i < measure.vector.length; i++) {
                    const substructedIntensity = Number(measure.vector[i].waveIntensity) - Number(baseVector[i].waveIntensity);
                    matrix[i].push(substructedIntensity);
                }
            }
        }
    };

    async function loadMeaurements() {
        const measurementFiles = getFilePaths(files);
        const measurementsObjects = await getMeasuresObjects(measurementFiles);
        const matrix = initWaveLengthColumnInMatrix(measurementsObjects);
        if (normalize) {
            buildMatrixWithNormalize(measurementsObjects, matrix);
        } else {
            buildMatrix(measurementsObjects, matrix);
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
                    // If we dont set it now, it will be an empty string. Will change only if user will change it
                    setBaseMeasurement(filePathsInDir[0].name);
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
            <Button primary text="Continue" disabled={files.length === 0} onClick={loadMeaurements} />
        </div>
    </div>;
};

export default LoadPage;
