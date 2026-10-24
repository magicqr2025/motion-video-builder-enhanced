// MotionStudio launcher (MotionStudio.exe).
// Starts the MotionStudio server in the background, opens it in a full-screen browser window and, when that window is
// closed, stops the server again. It needs Node.js and Google Chrome or Microsoft Edge on the PC (Windows has Edge built in).
// Build it with launcher\build-exe.cmd. Written for the C# 5 compiler that ships with Windows.
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

static class MotionStudioLauncher
{
    const int Port = 4321;
    static readonly string Url = "http://localhost:" + Port + "/";

    static string Health()
    {
        try
        {
            HttpWebRequest rq = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + Port + "/api/health");
            rq.Timeout = 1500; rq.ReadWriteTimeout = 1500;
            using (WebResponse rs = rq.GetResponse())
            using (StreamReader sr = new StreamReader(rs.GetResponseStream()))
                return sr.ReadToEnd();
        }
        catch { return null; }
    }

    static int Number(string json, string key)
    {
        int i = json.IndexOf("\"" + key + "\":");
        if (i < 0) return 0;
        i += key.Length + 3;
        int j = i;
        while (j < json.Length && char.IsDigit(json[j])) j++;
        int n; return int.TryParse(json.Substring(i, j - i), out n) ? n : 0;
    }
    static bool Flag(string json, string key) { return json.IndexOf("\"" + key + "\":true") >= 0; }

    static string FindOnPath(string exe)
    {
        string path = Environment.GetEnvironmentVariable("PATH") ?? "";
        foreach (string dir in path.Split(';'))
        {
            try { string f = Path.Combine(dir.Trim().Trim('"'), exe); if (File.Exists(f)) return f; } catch { }
        }
        return null;
    }

    static string FindNode()
    {
        string f = FindOnPath("node.exe");
        if (f != null) return f;
        string[] roots = { Environment.GetEnvironmentVariable("ProgramFiles"), Environment.GetEnvironmentVariable("ProgramFiles(x86)"), Environment.GetEnvironmentVariable("LOCALAPPDATA") };
        foreach (string r in roots)
        {
            if (string.IsNullOrEmpty(r)) continue;
            string c = Path.Combine(Path.Combine(r, "nodejs"), "node.exe");
            if (File.Exists(c)) return c;
        }
        return null;
    }

    static string FindBrowser()
    {
        string pf = Environment.GetEnvironmentVariable("ProgramFiles"), pf86 = Environment.GetEnvironmentVariable("ProgramFiles(x86)"), local = Environment.GetEnvironmentVariable("LOCALAPPDATA");
        string[] candidates = {
            pf == null ? null : Path.Combine(pf, @"Google\Chrome\Application\chrome.exe"),
            pf86 == null ? null : Path.Combine(pf86, @"Google\Chrome\Application\chrome.exe"),
            local == null ? null : Path.Combine(local, @"Google\Chrome\Application\chrome.exe"),
            pf86 == null ? null : Path.Combine(pf86, @"Microsoft\Edge\Application\msedge.exe"),
            pf == null ? null : Path.Combine(pf, @"Microsoft\Edge\Application\msedge.exe")
        };
        foreach (string c in candidates) { if (c != null && File.Exists(c)) return c; }
        return null;
    }

    static void Fail(string message) { MessageBox.Show(message, "MotionStudio", MessageBoxButtons.OK, MessageBoxIcon.Warning); }

    static bool RunVisible(string workDir, string command)
    {
        try
        {
            ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c " + command + " & if errorlevel 1 pause");
            psi.WorkingDirectory = workDir; psi.UseShellExecute = true;
            using (Process p = Process.Start(psi)) { p.WaitForExit(); return p.ExitCode == 0; }
        }
        catch { return false; }
    }

    static Process OpenWindow(string browser)
    {
        string profile = Path.Combine(Environment.GetEnvironmentVariable("LOCALAPPDATA") ?? Path.GetTempPath(), @"MotionStudio\browser");
        Directory.CreateDirectory(profile);
        // a window of its own (own profile), no address bar, full screen
        string args = "--user-data-dir=\"" + profile + "\" --app=" + Url + " --start-fullscreen --no-first-run --no-default-browser-check";
        try { return Process.Start(browser, args); } catch { return null; }
    }

    [STAThread]
    static int Main(string[] argv)
    {
        string appDir = AppDomain.CurrentDomain.BaseDirectory;
        string studio = Path.Combine(appDir, "studio");
        string node = FindNode(), browser = FindBrowser();

        if (argv.Length > 0 && argv[0] == "--selftest")
        {
            File.WriteAllText(Path.Combine(appDir, "launcher-selftest.txt"), "app: " + appDir + "\r\nserver script: " + File.Exists(Path.Combine(studio, @"server\index.mjs")) + "\r\nnode: " + (node ?? "NOT FOUND") + "\r\nbrowser: " + (browser ?? "NOT FOUND") + "\r\nserver running: " + (Health() != null) + "\r\n");
            return 0;
        }

        if (!File.Exists(Path.Combine(studio, @"server\index.mjs")))
        { Fail("MotionStudio.exe must sit in the project folder, next to the \"studio\" folder.\n\nFolder: " + appDir); return 1; }

        bool createdNew;
        using (Mutex single = new Mutex(true, "MotionStudio.Launcher.Single", out createdNew))
        {
            // already open: just show another window
            if (!createdNew || Health() != null)
            {
                if (browser != null) OpenWindow(browser); else Process.Start(Url);
                return 0;
            }

            if (node == null) { Fail("MotionStudio needs Node.js.\n\nInstall the LTS version from https://nodejs.org, then start MotionStudio again."); return 1; }

            // first run on this PC: install the packages
            if (!Directory.Exists(Path.Combine(studio, "node_modules")) && !RunVisible(studio, "npm install --loglevel=error")) { Fail("Could not install the studio packages. Check the internet connection and try again."); return 1; }
            string reel = Path.Combine(appDir, "magicbolt-reel");
            if (Directory.Exists(reel) && !Directory.Exists(Path.Combine(reel, "node_modules")) && !RunVisible(reel, "npm install --loglevel=error")) { Fail("Could not install the video packages. Check the internet connection and try again."); return 1; }

            // the server, in the background, with its output in studio\data\server.log
            Directory.CreateDirectory(Path.Combine(studio, "data"));
            StreamWriter log = new StreamWriter(Path.Combine(studio, @"data\server.log"), false, new UTF8Encoding(false));
            log.AutoFlush = true;
            ProcessStartInfo psi = new ProcessStartInfo(node, "server/index.mjs --no-open");
            psi.WorkingDirectory = studio; psi.UseShellExecute = false; psi.CreateNoWindow = true;
            psi.RedirectStandardOutput = true; psi.RedirectStandardError = true;
            Process server = new Process(); server.StartInfo = psi;
            server.OutputDataReceived += delegate(object s, DataReceivedEventArgs e) { if (e.Data != null) lock (log) log.WriteLine(e.Data); };
            server.ErrorDataReceived += delegate(object s, DataReceivedEventArgs e) { if (e.Data != null) lock (log) log.WriteLine(e.Data); };
            server.Start(); server.BeginOutputReadLine(); server.BeginErrorReadLine();

            DateTime until = DateTime.Now.AddSeconds(90);
            while (Health() == null)
            {
                if (server.HasExited || DateTime.Now > until)
                { Fail("MotionStudio could not start.\n\nDetails are in:\n" + Path.Combine(studio, @"data\server.log")); try { if (!server.HasExited) server.Kill(); } catch { } return 1; }
                Thread.Sleep(400);
            }

            Process window = browser != null ? OpenWindow(browser) : null;
            if (browser == null) Process.Start(Url);

            // keep going while a window is open; when the last one has been closed for a while, stop the server
            bool seen = false; DateTime emptySince = DateTime.MinValue, started = DateTime.Now;
            while (!server.HasExited)
            {
                Thread.Sleep(3000);
                string h = Health();
                if (h == null) continue;
                int windows = Number(h, "windows");
                if (windows > 0) { seen = true; emptySince = DateTime.MinValue; continue; }
                if (emptySince == DateTime.MinValue) emptySince = DateTime.Now;
                double waited = (DateTime.Now - emptySince).TotalSeconds;
                bool busy = Flag(h, "busy");
                if (!busy && ((seen && waited > 15) || (!seen && (DateTime.Now - started).TotalSeconds > 180))) break;
            }

            if (!server.HasExited)
            {
                ProcessStartInfo kill = new ProcessStartInfo("taskkill", "/T /F /PID " + server.Id);
                kill.CreateNoWindow = true; kill.UseShellExecute = false;
                Process.Start(kill).WaitForExit(5000);
            }
            // the window cannot outlive the server: close it too if it is still there
            try { if (window != null && !window.HasExited) window.CloseMainWindow(); } catch { }
            log.Close();
        }
        return 0;
    }
}
