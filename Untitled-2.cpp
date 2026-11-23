#include <bits/stdc++.h>
 
using namespace std;
 
int main() 
{
    int t;
    cin >> t;
    while (t--) 
    {
        int n;
        cin >> n;
        cout << "? 1 " << n << endl;
        int a;
        cin >> a;
        if (a == -1)
        {
            exit(0);
        }
        if (a == 0 || a == n)
        {
            cout << "! NO" << endl;
            continue;
        }
        cout << "? 1 " << a << endl;
        int b;
        cin >> b;
        if (b == -1)
        {
            exit(0);
        }
        if (b < a)
        {
            cout << "! YES" << endl;
        }
        else
        {
            cout << "! NO" << endl;
        }
    }
    return 0;
}