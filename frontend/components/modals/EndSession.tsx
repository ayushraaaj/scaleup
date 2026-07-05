const EndSession = (props: any) => {
  const { fullname, onContinueSession, onAcceptEndSession } = props;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold">
          {fullname} wants to end this session.
        </h2>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onContinueSession} className="px-4 py-2 border">
            Continue Session
          </button>

          <button
            onClick={onAcceptEndSession}
            className="bg-red-500 text-white px-4 py-2"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSession;
