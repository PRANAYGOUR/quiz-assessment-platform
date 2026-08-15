import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Printer, Award } from 'lucide-react';

export default function Certificate() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/${id}/result`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchResult();
  }, [id]);

  if (!data) return <div className="p-10 text-center">Loading certificate...</div>;

  const percentage = Math.round((data.attempt.score / data.attempt.totalMarks) * 100) || 0;

  if (percentage < 60) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        You must score at least 60% to earn a certificate.
        <br/><br/>
        <Link to="/dashboard" className="text-blue-500 underline">Return Home</Link>
      </div>
    );
  }

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex flex-col items-center">
      {/* Controls - Hidden during print */}
      <div className="mb-6 flex gap-4 print:hidden w-full max-w-4xl px-4">
        <Link to={`/result/${id}`} className="bg-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-gray-50 font-semibold text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button onClick={printCertificate} className="bg-blue-600 text-white px-6 py-2 rounded shadow flex items-center gap-2 hover:bg-blue-700 font-bold ml-auto">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Certificate Container */}
      <div className="w-full max-w-4xl bg-white p-2 shadow-2xl print:shadow-none print:p-0 border border-gray-300">
        
        {/* Certificate Border */}
        <div className="border-8 border-double border-[var(--color-primary-green)] p-12 text-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          
          <div className="absolute top-0 left-0 w-32 h-32 border-b-[20px] border-r-[20px] border-[var(--color-primary-green)] rounded-br-full opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-t-[20px] border-l-[20px] border-[var(--color-primary-green)] rounded-tl-full opacity-20"></div>

          <Award className="w-24 h-24 mx-auto text-yellow-500 mb-6" />
          
          <h1 className="text-5xl font-serif font-bold text-gray-800 mb-4 tracking-widest uppercase">
            Certificate of Excellence
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 font-serif italic">This is to certify that</p>
          
          <h2 className="text-4xl font-bold text-[var(--color-primary-green)] mb-8 border-b-2 border-gray-300 inline-block px-10 pb-2">
            {data.user.name}
          </h2>
          
          <p className="text-lg text-gray-600 mb-4 font-serif italic">has successfully completed the assessment</p>
          
          <h3 className="text-3xl font-bold text-gray-800 mb-10">
            {data.quiz.title}
          </h3>
          
          <p className="text-md text-gray-700 mb-16 max-w-2xl mx-auto">
            with a passing score of <strong>{percentage}%</strong>, demonstrating exceptional knowledge and technical proficiency in the subject matter.
          </p>
          
          {/* Signatures */}
          <div className="flex justify-between items-end mt-12 px-12">
            <div className="text-center w-48">
              <div className="border-b-2 border-gray-800 mb-2 font-serif text-2xl text-gray-700 italic">Auto-Evaluated</div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Evaluation Engine</p>
            </div>
            
            <div className="text-center w-48">
              <div className="border-b-2 border-gray-800 mb-2 font-bold text-lg text-gray-700 pb-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Date Issued</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
