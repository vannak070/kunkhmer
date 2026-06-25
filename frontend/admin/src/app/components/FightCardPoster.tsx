import { forwardRef } from "react";

interface Match {
  id: string;
  matchOrder: number;
  fighterA: {
    name: string;
    image: string;
    record: string;
    gym: string;
  };
  fighterB: {
    name: string;
    image: string;
    record: string;
    gym: string;
  };
  weightClass: string;
  rounds: number;
  notes?: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  eventName: string;
  eventDate: string;
  matches: Match[];
  status: string;
  totalMatches: number;
  createdBy?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

interface FightCardPosterProps {
  batch: Batch;
}

export const FightCardPoster = forwardRef<HTMLDivElement, FightCardPosterProps>(
  ({ batch }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white w-[794px] h-auto p-12"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          {/* Title (Center) */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black text-[#1A1A24] mb-2">
              ព្រះរាជាណាចក្រកម្ពុជា
            </h1>
            <h2 className="text-xl font-black text-[#0A3D91] mb-1">
              សហព័ន្ធ គុនខ្មែរ ព្រះរាជាណាចក្រ
            </h2>
            <div className="w-32 h-0.5 bg-[#C8102E] mx-auto my-2"></div>
            <p className="text-sm font-bold text-[#707070]">
              KUN KHMER FEDERATION OF CAMBODIA
            </p>
          </div>
        </div>

        {/* Event Info */}
        <div className="text-center mb-6 border-t-2 border-b-2 border-[#E0E0E0] py-4">
          <h3 className="text-lg font-black text-[#1A1A24] mb-2">កម្មវិធីប្រកួតកីឡា គុនខ្មែរ</h3>
          <p className="text-base font-bold text-[#0A3D91] mb-2">{batch.eventName}</p>
          <p className="text-sm font-bold text-[#707070]">
            <span className="text-[#C8102E]">WURKZ រៀបចំផ្សព្វផ្សាយដោយផ្ទាល់</span>
          </p>
          <div className="mt-3 text-sm font-bold text-[#1A1A24]">
            <p>ទីកន្លែងប្រកួត: វីឡាអូឡាំពិច គុនខ្មែរ ក្រុងបាត់ដំបង</p>
            <p className="mt-1">ថ្ងៃប្រកួត: {batch.eventDate} • ម៉ោងចាប់ ១៩:០០នាទី គ្នាទី</p>
          </div>
        </div>

        {/* Matches Table */}
        <table className="w-full border-2 border-[#1A1A24]">
          <thead>
            <tr className="bg-[#E0E0E0]">
              <th className="border-2 border-[#1A1A24] px-2 py-3 text-sm font-black text-[#1A1A24] w-16">
                ល្ខ
              </th>
              <th className="border-2 border-[#1A1A24] px-4 py-3 text-sm font-black text-white bg-[#C8102E]">
                មុំក្រហម RED
              </th>
              <th className="border-2 border-[#1A1A24] px-4 py-3 text-sm font-black text-[#1A1A24] bg-[#E0E0E0]">
                ទំងន់ WEIGHT
              </th>
              <th className="border-2 border-[#1A1A24] px-4 py-3 text-sm font-black text-white bg-[#0A3D91]">
                មុំខៀវ BLUE
              </th>
            </tr>
          </thead>
          <tbody>
            {batch.matches.map((match, index) => {
              const fighterBGym = match.fighterB?.gym || '';
              const isSpecialMatch = match.notes?.includes('ពិសេស') || fighterBGym.includes('Myanmar') || fighterBGym.includes('China');
              
              return (
                <tr key={match.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                  <td className="border-2 border-[#1A1A24] px-2 py-4 text-center">
                    <div className="font-black text-lg text-[#1A1A24]">{match.matchOrder}</div>
                    {isSpecialMatch && (
                      <div className="text-xs font-black text-[#C8102E] mt-1">ប្រកួតពិសេស</div>
                    )}
                  </td>
                  <td className="border-2 border-[#1A1A24] px-4 py-4">
                    <div className="font-black text-base text-[#1A1A24] mb-1">{match.fighterA?.name || 'TBD'}</div>
                    <div className="text-xs font-bold text-[#707070]">{match.fighterA?.gym || ''}</div>
                    <div className="text-xs text-[#B0B0B0] mt-1">{match.fighterA?.record || ''}</div>
                  </td>
                  <td className="border-2 border-[#1A1A24] px-4 py-4 text-center">
                    <div className="font-black text-sm text-[#1A1A24] mb-1">គុនខ្មែរ</div>
                    <div className="font-black text-base text-[#0A3D91]">KUN KHMER</div>
                    <div className="font-black text-lg text-[#C8102E] mt-1">{match.weightClass}</div>
                  </td>
                  <td className="border-2 border-[#1A1A24] px-4 py-4">
                    <div className="font-black text-base text-[#1A1A24] mb-1">{match.fighterB?.name || 'TBD'}</div>
                    {fighterBGym.includes('Myanmar') && (
                      <div className="text-xs font-black text-[#C8102E]">(Myanmar)</div>
                    )}
                    {fighterBGym.includes('China') && (
                      <div className="text-xs font-black text-[#C8102E]">(China)</div>
                    )}
                    {fighterBGym.includes('Uzbekistan') && (
                      <div className="text-xs font-black text-[#C8102E]">(Uzbekistan)</div>
                    )}
                    {!fighterBGym.includes('Myanmar') && 
                     !fighterBGym.includes('China') && 
                     !fighterBGym.includes('Uzbekistan') && fighterBGym && (
                      <div className="text-xs font-bold text-[#707070]">{fighterBGym}</div>
                    )}
                    <div className="text-xs text-[#B0B0B0] mt-1">{match.fighterB?.record || ''}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-[#E0E0E0]">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-bold text-[#1A1A24] mb-1">
                ព្រះរាជាណាចក្រកម្ពុជា / KINGDOM OF CAMBODIA
              </p>
              <p className="text-sm font-bold text-[#1A1A24] mb-1">
                សហព័ន្ធកីឡាគុនខ្មែរ / KUN KHMER FEDERATION
              </p>
              <p className="text-sm font-bold text-[#0A3D91]">
                www.kunkhmer.org.kh
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FightCardPoster.displayName = 'FightCardPoster';