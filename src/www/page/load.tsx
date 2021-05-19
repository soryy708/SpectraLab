import fs from 'fs';
import util from 'util';
import path from 'path';
import React, { useState, useEffect } from 'react';
import electron from 'electron';
import ButtonedInput from '../components/buttonedInput';
import Button from '../components/button';
import RangeSelect from '../components/rangeSelect';
import Matrix from '../../matrix';

type LoadPageProps = {
    onLoad: (matrix: Matrix) => void;
};

type MeasurementFile = {
    frequencies: number[];
    amplitudes: number[];
};

const LoadPage: React.FunctionComponent<LoadPageProps> = (props: LoadPageProps) => {
    const [measurementsPath, setMeasurementsPath] = useState('');
    const [normalize, setNormalize] = useState<boolean>(false);
    const [files, setFiles] = useState<string[]>([]);
    const [baseMeasurement, setBaseMeasurement] = useState('');
    const [frequencies, setFrequencies] = useState<number[]>([]);
    const [frequencyRangeMin, setFrequencyRangeMin] = useState<number>(NaN);
    const [frequencyRangeMax, setFrequencyRangeMax] = useState<number>(NaN);

    async function parseFile(filePath: string): Promise<MeasurementFile> {
        const columnDeliminator = /\s+/u;
        const lineDeliminator = '\n';

        const asText = await fs.promises.readFile(filePath, 'utf8');
        const lines = asText.split(lineDeliminator);
        const table = lines.map(line => line.replace(/[ \t]+/u, '\t').trim().split(columnDeliminator));
        const data: {frequency: number, amplitude: number}[] = table.map(row => ({frequency: Number(row[0]), amplitude: Number(row[1])}));
        return {
            frequencies: data.map(datum => datum.frequency),
            amplitudes: data.map(datum => datum.amplitude),
        };
    }

    function normalizeSpectrums(spectrums: number[][], base: number[]): number[][] {
        return spectrums.map(spectrum => spectrum.map((amplitude, i) => amplitude - base[i]));
    }

    async function loadMeaurements() {
        const measurementFilePaths = files.map(file => path.join(measurementsPath, file));
        const measurements = await Promise.all(measurementFilePaths.map(filePath => parseFile(filePath)));
        const baseMeasurementIndex = files.findIndex(file => file === baseMeasurement);
        const base = measurements[baseMeasurementIndex];
        
        const minFreq = isNaN(frequencyRangeMin) ? frequencies[0] : frequencyRangeMin;
        const maxFreq = isNaN(frequencyRangeMax) ? frequencies[frequencies.length - 1] : frequencyRangeMax;
        let indexMin = frequencies.findIndex(freq => freq >= minFreq);
        if (indexMin === -1) {
            indexMin = 0;
        }
        let indexMax = frequencies.reverse().findIndex(freq => freq <= maxFreq);
        if (indexMax === -1) {
            indexMax = 0;
        }
        indexMax = frequencies.length-1 - indexMax;

        const baseAmplitude = base.amplitudes.slice(indexMin, indexMax + 1);
        const spectrums = measurements.map(measurement => measurement.amplitudes.slice(indexMin, indexMax + 1));
        const matrix = normalize ? normalizeSpectrums(spectrums, baseAmplitude) : spectrums;
        props.onLoad(new Matrix(matrix));
    }

    useEffect(() => {
        if (files.length === 0 || !baseMeasurement) {
            return;
        }
        (async() => {
            const { frequencies: parsedFrequencies } = await parseFile(path.join(measurementsPath, baseMeasurement));
            setFrequencies(parsedFrequencies.sort((a, b) => a - b));
        })()
            .catch(err => console.error(err));
    }, [measurementsPath, baseMeasurement]);

    return <div className="page loadPage">
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

        {frequencies.length > 0 && <div className="formElement frequenciesRange">
            <label className="label">Frequencies</label>
            <RangeSelect
                options={frequencies}
                minValue={frequencyRangeMin}
                maxValue={frequencyRangeMax}
                onChangeMin={newValue => setFrequencyRangeMin(newValue)}
                onChangeMax={newValue => setFrequencyRangeMax(newValue)}
                compare={(lval, rval) => lval - rval}
            />
        </div>}

        <div style={{ textAlign: 'center' }}>
            <Button primary text="Continue" disabled={files.length === 0} onClick={loadMeaurements} />
        </div>
    </div>;
};

export default LoadPage;
